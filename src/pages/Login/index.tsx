/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { FormCheck, FormInput, FormLabel } from '@/components/Base/Form';
// import Tippy from "@/components/Base/Tippy";
// import users from "@/fakers/users";
import Button from '@/components/Base/Button';
import { getShortBuildInfo } from '@/utils/buildInfo';
import clsx from 'clsx';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import {
  getUserRoleDetails,
  loginUser,
} from '@/redux-toolkit/slices/auth/authAPI';
import { selectAuth } from '@/redux-toolkit/slices/auth/authSelectors';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import {
  loginSuccess,
  onload,
  loginFailure,
  clearError,
} from '@/redux-toolkit/slices/auth/authSlice';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Lucide from '@/components/Base/Lucide';
import { NotificationElement } from '@/components/Base/Notification';
import { useAuth } from '@/components/context/AuthContext';
// import socket from "@/socket/socket";
import {
  updateMenu,
  initializeMenu,
} from '@/redux-toolkit/slices/common/sideMenu/sideMenuSlice';
// import { checkUserFirstLogin } from '@/redux-toolkit/slices/user/userAPI';
import ForgotPassword from '@/components/ForgotPassword';
import { updateSessionId } from '@/utils/crossTabAuthSync';
import { Status } from '@/constants';
import {
  addAllNotification,
  removeNotificationById,
} from '@/redux-toolkit/slices/AllNoti/allNotifications';
import NotificationManager from '@/components/Base/Notification/NotificationManager';
interface CustomJwtPayload {
  company_id: any;
  user_id: string;
  user_name: string;
  designation: string;
  role: string;
  code: string[];
  id: string;
  session_id: string;
}

function Main() {
  const { setToken } = useAuth();

  const dispatch = useAppDispatch();
  const userLogin = useAppSelector(selectAuth);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const INITIAL_LOGIN_OBJ = {
    username: '',
    password: '',
    rememberMe: false,
    isAdminLogin: false, // Add this
    uniqueId: '', // Add this
  };
  const [loginObj, setLoginObj] = useState(INITIAL_LOGIN_OBJ);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginFirst, setIsLoginFirst] = useState(false);
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [userRoleError, setUserRoleError] = useState('');
  const notifications = useAppSelector(
    (state) => state.allNotification.allNotifications,
  );
  const notificationRefs = useRef<Map<string, NotificationElement>>(new Map());
  interface LoginUserInfo {
    data?: {
      accessToken: string;
      user?: {
        [key: string]: unknown;
      };
      sessionId?: string;
      isLoginFirst?: boolean;
    };
  }

  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[notifications.length - 1];
      if (latestNotification) {
        const ref = notificationRefs.current.get(latestNotification.id);
        if (ref && latestNotification.id) {
          notificationRefs.current.forEach((_, id) => {
            if (id !== latestNotification.id) {
              dispatch(removeNotificationById(id));
              notificationRefs.current.delete(id);
            }
          });
          ref.showToast();
          setTimeout(() => {
            dispatch(removeNotificationById(latestNotification.id));
            notificationRefs.current.delete(latestNotification.id);
          }, 3000);
        }
      }
    }
  }, [notifications.length, dispatch]);

  const handleLoginSuccess = useCallback(
    (loginUserInfo: LoginUserInfo) => {
      if (loginUserInfo?.data?.accessToken) {
        // Save token and user data to localStorage
        localStorage.setItem('accessToken', loginUserInfo?.data?.accessToken);
        setToken(loginUserInfo?.data?.accessToken);

        const userData = jwtDecode<CustomJwtPayload>(
          loginUserInfo?.data?.accessToken,
        );
        localStorage.setItem(
          'userData',
          JSON.stringify({
            name: userData?.user_name,
            designation: userData?.designation,
            role: userData?.role,
            userId: userData?.user_id,
            companyId: userData?.company_id,
          }),
        );

        // Update menu immediately after setting user data
        if (
          [
            'ADMIN',
            'TRANSACTIONS',
            'OPERATIONS',
            'MERCHANT',
            'SUB_MERCHANT',
            'MERCHANT_OPERATIONS',
            'VENDOR',
            'VENDOR_OPERATIONS',
          ].includes(userData?.designation)
        ) {
          dispatch(
            updateMenu(
              userData?.designation as
                | 'ADMIN'
                | 'TRANSACTIONS'
                | 'OPERATIONS'
                | 'MERCHANT'
                | 'SUB_MERCHANT'
                | 'MERCHANT_OPERATIONS'
                | 'VENDOR'
                | 'VENDOR_OPERATIONS',
            ),
          );
        } else {
          // Invalid role - initialize menu from localStorage as fallback
          dispatch(initializeMenu());
        }

        // Socket connection is now handled automatically by the SocketContext
        // when accessToken and userData are available in localStorage

        const sessionId = loginUserInfo?.data?.sessionId;
        localStorage.setItem('userSession', JSON.stringify(sessionId));

        // Update cross-tab auth sync with new session ID
        if (sessionId) {
          updateSessionId(sessionId);
        }

        // Dispatch the login success action
        if (loginUserInfo.data) {
          dispatch(
            loginSuccess({
              accessToken: loginUserInfo.data.accessToken,
              user: loginUserInfo.data.user || {},
            }),
          );
        }

        // Trigger cross-tab login event to refresh other tabs
        if (
          sessionId &&
          userData?.user_id &&
          loginUserInfo?.data?.accessToken
        ) {
          // Import here to avoid circular dependency
          import('@/utils/crossTabAuthSync').then(
            ({ triggerCrossTabLogin }) => {
              if (loginUserInfo.data) {
                triggerCrossTabLogin(
                  sessionId,
                  userData.user_id,
                  loginUserInfo.data.accessToken,
                );
              }
            },
          );
        }
      }
    },
    [dispatch, setToken],
  );
  // Listen for cross-tab login event and reload tab if detected
  useEffect(() => {
    let removeListener: (() => void) | undefined;
    import('@/utils/crossTabAuthSync').then(
      ({ onCrossTabLogin, offCrossTabLogin }) => {
        const reloadOnLogin = () => {
          window.location.reload();
        };
        onCrossTabLogin(reloadOnLogin);
        removeListener = () => offCrossTabLogin(reloadOnLogin);
      },
    );
    return () => {
      if (removeListener) removeListener();
    };
  }, []);
  const fetchLoginDetails = useCallback(
    async (userlogin: {
      username: string;
      password: string;
      newPassword?: string;
      uniqueId?: string;
    }) => {
      dispatch(onload({ load: true }));
      dispatch(clearError());
      try {
        const loginUserInfo = await loginUser(userlogin);
        //when server fails response changed from undefined
        if (!loginUserInfo || !loginUserInfo?.data) {
          dispatch(
            loginFailure({
              error: new Error('No response or invalid response from server'),
            }),
          );
          dispatch(
            addAllNotification({
              status: Status.ERROR,
              message: loginUserInfo?.error?.message || 'Failed to login',
            }),
          );
          dispatch(onload({ load: false }));
          return;
        }
        if (loginUserInfo?.data?.isLoginFirst) {
          dispatch(onload({ load: false }));
          setIsLoginFirst(true);
          dispatch(
            addAllNotification({
              status: Status.ERROR,
              message: 'Please change your password',
            }),
          );
          return;
        }

        if (loginUserInfo?.data?.accessToken) {
          handleLoginSuccess(loginUserInfo);
          // Manually trigger socket connection after login
          setTimeout(() => {
            if ((window as any).updateSocketAuth) {
              (window as any).updateSocketAuth();
            }
          }, 100);
          // No need for window.location.reload() - let React Router handle navigation
          // The socket will connect automatically after localStorage is updated
        } else {
          dispatch(loginFailure({ error: loginUserInfo?.error }));
          dispatch(
            addAllNotification({
              status: Status.ERROR,
              message:
                loginUserInfo?.error?.message || 'An unknown error occurred',
            }),
          );
        }
      } catch (error: any) {
        dispatch(loginFailure({ error }));
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: error?.message || 'Failed to login',
          }),
        );
      }
    },
    [dispatch, handleLoginSuccess],
  );

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const updateFormValue = ({
    updateType,
    value,
  }: {
    updateType: string;
    value: string | boolean;
  }) => {
    setLoginObj({ ...loginObj, [updateType]: value });
  };

  const handlePasswordChange = (field: string, value: string) => {
    const newPasswords = {
      ...passwords,
      [field]: value,
    };
    setPasswords(newPasswords);

    // Clear previous errors
    setPasswordError('');

    // Validate as user types
    if (field === 'newPassword') {
      if (value === loginObj.password) {
        setPasswordError('New password cannot be same as current password');
        return;
      }
      if (value.length > 0 && value.length < 8) {
        setPasswordError('Password must be at least 8 characters long');
        return;
      }
      // If confirm password is already entered, check match
      if (passwords.confirmPassword && value !== passwords.confirmPassword) {
        setPasswordError('Passwords do not match');
      }
    }

    if (field === 'confirmPassword' && newPasswords.newPassword) {
      if (value !== newPasswords.newPassword) {
        setPasswordError('Passwords do not match');
      }
    }
  };

  const handleForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoginFirst) {
      // Validate passwords
      if (!passwords.newPassword || !passwords.confirmPassword) {
        setPasswordError('Both password fields are required');
        return;
      }

      if (passwords.newPassword === loginObj.password) {
        setPasswordError('New password cannot be same as current password');
        return;
      }
      if (passwords.newPassword !== passwords.confirmPassword) {
        setPasswordError('Passwords do not match');
        return;
      }

      if (passwords.newPassword.length < 8) {
        setPasswordError('Password must be at least 8 characters long');
        return;
      }

      // Send both current password and new password
      fetchLoginDetails({
        username: loginObj.username,
        password: loginObj.password,
        newPassword: passwords.newPassword,
      });
    } else {
      // Normal login flow
      if (loginObj.username.trim() === '') {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'UserName is required!',
          }),
        );
      } else if (loginObj.password.trim() === '') {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'Password is required!',
          }),
        );
      } else if (loginObj.isAdminLogin && !loginObj.uniqueId) {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'Unique ID is required for admin login!',
          }),
        );
      } else {
        // Include both uniqueId and isAdminLogin in payload when admin login is checked
        const loginData = {
          username: loginObj.username,
          password: loginObj.password,
          ...(loginObj.isAdminLogin && {
            unique_admin_id: loginObj.uniqueId,
          }),
        };
        fetchLoginDetails(loginData);
      }
    }
  };

  // Debounce getUserRole API call by 3 seconds
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const getUserRole = (username: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (username) {
      debounceRef.current = setTimeout(async () => {
        const res = await getUserRoleDetails(username);
        if (res?.data) {
          if (res?.data?.isAdmin) {
            setLoginObj((prev) => ({
              ...prev,
              isAdminLogin: true,
            }));
          } else {
            setLoginObj((prev) => ({
              ...prev,
              isAdminLogin: false,
            }));
          }
          setIsButtonDisabled(false);
          setUserRoleError('');
        } else if (res?.error) {
          setLoginObj((prev) => ({
            ...prev,
            isAdminLogin: false,
          }));
          const errorMsg = res.error.message || 'Failed to fetch user role';
          setUserRoleError(errorMsg);
          setIsButtonDisabled(true);
        }
      }, 1000);
    }
  };

  return (
    <>
      {/* Background */}
      <div className="min-h-screen w-full relative overflow-hidden bg-slate-50 dark:bg-slate-950/95 transition-colors">
        {/* Soft radial glow */}
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-theme-1/25 blur-3xl dark:bg-theme-1/30" />
          <div className="absolute -bottom-40 -right-10 h-[26rem] w-[26rem] rounded-full bg-theme-2/20 blur-3xl dark:bg-theme-2/25" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.35),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(148,163,184,0.25),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(248,250,252,0.06),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(148,163,184,0.16),_transparent_55%)]" />
        </div>

        {/* Content wrapper */}
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[1.1fr_1.2fr] gap-8 lg:gap-10">
            {/* Left panel – login */}
            <div className="backdrop-blur-xl bg-white/90 border border-slate-200 rounded-3xl p-6 sm:p-8 lg:p-9 shadow-[0_22px_60px_rgba(15,23,42,0.10)] flex flex-col dark:bg-slate-900/80 dark:border-slate-800/70 dark:shadow-[0_24px_80px_rgba(15,23,42,0.85)] transition-colors">
              {/* Brand mark */}
              <div className="flex items-center gap-3">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 border border-slate-700/70 shadow-sm dark:bg-slate-900 dark:border-slate-700/70">
                  <div className="absolute inset-px rounded-[0.9rem] bg-gradient-to-br from-theme-1/85 via-theme-2/85 to-emerald-400/70 opacity-90" />
                  <div className="relative flex h-7 w-7 -rotate-45 items-center justify-center">
                    <div className="absolute inset-y-0 left-0 w-[22%] rounded-full bg-white/40" />
                    <div className="absolute inset-0 m-auto h-[120%] w-[22%] rounded-full bg-white" />
                    <div className="absolute inset-y-0 right-0 w-[22%] rounded-full bg-white/40" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium tracking-[0.18em] uppercase text-slate-500 dark:text-slate-400">
                    TrustPay
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-500">Control Center</span>
                </div>
              </div>

              {/* Heading */}
              <div className="mt-8">
                <h1 className="text-2xl sm:text-[1.7rem] font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                  {isLoginFirst ? 'Update your password' : 'Welcome back'}
                </h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {isLoginFirst
                    ? 'For security, please choose a new password before accessing your dashboard.'
                    : 'Sign in to review transactions, manage payouts, and keep your payment operations in sync.'}
                </p>
              </div>

              {/* Form */}
              <div className="mt-7 flex-1">
                {showForgotPassword ? (
                  <ForgotPassword
                    onBack={() => setShowForgotPassword(false)}
                    onSuccess={() => {
                      setShowForgotPassword(false);
                    }}
                  />
                ) : (
                  <form onSubmit={handleForm} className="space-y-5">
                    {!isLoginFirst && (
                      <>
                        <div className="space-y-2">
                          <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            Username<span className="text-danger ml-0.5">*</span>
                          </FormLabel>
                          <FormInput
                            type="text"
                            className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-theme-1/70 focus:ring-2 focus:ring-theme-1/25 focus:outline-none transition-all dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500"
                            placeholder="Enter your username"
                            value={loginObj.username}
                            onChange={(e) => {
                              getUserRole(e.target.value);
                              updateFormValue({
                                updateType: 'username',
                                value: e.target.value,
                              });
                            }}
                            required
                          />
                          {userRoleError && (
                            <p className="text-xs text-danger mt-1">
                              {userRoleError}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            Password<span className="text-danger ml-0.5">*</span>
                          </FormLabel>
                          <div className="relative">
                            <FormInput
                              type={showPassword ? 'text' : 'password'}
                              className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-theme-1/70 focus:ring-2 focus:ring-theme-1/25 focus:outline-none transition-all dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500"
                              placeholder="Enter your password"
                              value={loginObj.password}
                              onChange={(e) =>
                                updateFormValue({
                                  updateType: 'password',
                                  value: e.target.value,
                                })
                              }
                              required
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors dark:text-slate-500 dark:hover:text-slate-300"
                              onClick={togglePasswordVisibility}
                            >
                              {showPassword ? (
                                <Lucide className="stroke-[1.4] h-4 w-4" icon="Eye" />
                              ) : (
                                <Lucide className="stroke-[1.4] h-4 w-4" icon="EyeOff" />
                              )}
                            </button>
                          </div>
                        </div>

                        {loginObj.isAdminLogin && (
                          <div className="space-y-2">
                            <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              Unique ID<span className="text-danger ml-0.5">*</span>
                            </FormLabel>
                            <FormInput
                              type="text"
                              className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-theme-1/70 focus:ring-2 focus:ring-theme-1/25 focus:outline-none transition-all dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500"
                              placeholder="Enter unique admin ID"
                              value={loginObj.uniqueId}
                              onChange={(e) =>
                                updateFormValue({
                                  updateType: 'uniqueId',
                                  value: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 text-xs text-slate-500 dark:text-slate-400">
                          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                            <FormCheck.Input
                              id="remember-me"
                              type="checkbox"
                              className="border-slate-300 rounded-md dark:border-slate-600"
                              checked={loginObj.rememberMe}
                              onChange={(e) =>
                                updateFormValue({
                                  updateType: 'rememberMe',
                                  value: e.target.checked,
                                })
                              }
                            />
                            <span>Remember this device</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            className="font-medium text-[0.78rem] text-theme-1 hover:text-theme-2 transition-colors"
                          >
                            Forgot password?
                          </button>
                        </div>
                      </>
                    )}

                    {isLoginFirst && (
                      <>
                        <div className="space-y-2">
                          <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            New password<span className="text-danger ml-0.5">*</span>
                          </FormLabel>
                          <div className="relative">
                            <FormInput
                              type={showPassword ? 'text' : 'password'}
                              className={clsx(
                                'block w-full rounded-xl border bg-white px-4 py-3 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all focus:ring-2 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500',
                                passwordError && passwords.newPassword
                                  ? 'border-danger focus:ring-danger/40'
                                  : 'border-slate-700/70 focus:border-theme-1/70 focus:ring-theme-1/30',
                              )}
                              placeholder="Create a new password"
                              value={passwords.newPassword}
                              onChange={(e) =>
                                handlePasswordChange(
                                  'newPassword',
                                  e.target.value,
                                )
                              }
                              required
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors dark:text-slate-500 dark:hover:text-slate-300"
                              onClick={togglePasswordVisibility}
                            >
                              {showPassword ? (
                                <Lucide className="stroke-[1.4] h-4 w-4" icon="Eye" />
                              ) : (
                                <Lucide className="stroke-[1.4] h-4 w-4" icon="EyeOff" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            Confirm new password<span className="text-danger ml-0.5">*</span>
                          </FormLabel>
                          <div className="relative">
                            <FormInput
                              type={showPassword ? 'text' : 'password'}
                              className={clsx(
                                'block w-full rounded-xl border bg-white px-4 py-3 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all focus:ring-2 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500',
                                passwordError && passwords.confirmPassword
                                  ? 'border-danger focus:ring-danger/40'
                                  : 'border-slate-700/70 focus:border-theme-1/70 focus:ring-theme-1/30',
                              )}
                              placeholder="Re-enter new password"
                              value={passwords.confirmPassword}
                              onChange={(e) =>
                                handlePasswordChange(
                                  'confirmPassword',
                                  e.target.value,
                                )
                              }
                              required
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors dark:text-slate-500 dark:hover:text-slate-300"
                              onClick={togglePasswordVisibility}
                            >
                              {showPassword ? (
                                <Lucide className="stroke-[1.4] h-4 w-4" icon="Eye" />
                              ) : (
                                <Lucide className="stroke-[1.4] h-4 w-4" icon="EyeOff" />
                              )}
                            </button>
                          </div>
                        </div>

                        {passwordError && (
                          <p className="text-xs text-danger mt-1">
                            {passwordError}
                          </p>
                        )}
                      </>
                    )}

                    <div className="pt-2">
                      <Button
                        variant="primary"
                        rounded
                        disabled={userLogin.loading || isButtonDisabled}
                        className="w-full py-3.5 text-sm font-medium tracking-wide rounded-xl bg-gradient-to-r from-theme-1 via-theme-2 to-emerald-400 text-slate-950 shadow-[0_14px_45px_rgba(34,197,94,0.35)] hover:shadow-[0_18px_60px_rgba(34,197,94,0.45)] transition-shadow disabled:opacity-60 disabled:shadow-none border-0"
                      >
                        {userLogin.loading
                          ? 'Signing you in...'
                          : isLoginFirst
                          ? 'Update password & continue'
                          : 'Sign in'}
                      </Button>
                    </div>
                  </form>
                )}
              </div>

              {/* Footer small build info (mobile) */}
              <div className="mt-6 flex items-center justify-between text-[0.7rem] text-slate-500 dark:text-slate-500">
                <span>Protected workspace</span>
                <span className="rounded-full bg-slate-100 px-2 py-1 border border-slate-200 text-[0.65rem] font-mono uppercase tracking-wide dark:bg-slate-900/70 dark:border-slate-700/60">
                  {getShortBuildInfo()}
                </span>
              </div>
            </div>

            {/* Right panel – marketing / illustration */}
            <div className="relative hidden lg:flex flex-col justify-between rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 px-8 py-8 overflow-hidden shadow-[0_22px_60px_rgba(148,163,184,0.25)] dark:border-slate-800/70 dark:bg-gradient-to-br dark:from-slate-900/90 dark:via-slate-900/80 dark:to-slate-950/95 dark:shadow-[0_24px_80px_rgba(15,23,42,0.85)] transition-colors">
              {/* Top: theme switcher aligned top-right */}
              <div className="flex justify-end ">
                  <ThemeSwitcher />
              </div>

              {/* Middle content */}
              <div>
                <h2 className="text-[2rem] leading-tight font-semibold text-slate-900 dark:text-slate-50">
                  Seamless payments,
                  <br />
                  <span className="bg-gradient-to-r from-theme-1 via-theme-2 to-emerald-400 bg-clip-text text-transparent">
                    built for modern teams
                  </span>
                </h2>
                <p className="mt-4 text-sm text-slate-600 max-w-md dark:text-slate-400">
                  Monitor every transaction in real time, catch anomalies
                  early, and keep your payout flows running without friction.
                  Opinions, alerts, and insights — all in one place.
                </p>

                {/* Metrics row */}
                <div className="mt-7 flex flex-wrap gap-5 text-xs text-slate-600 dark:text-slate-300">
                  <div>
                    <div className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                      180k+
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">Active merchants</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                      &lt;120ms
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">Avg. payment latency</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                      99.99%
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">Uptime this quarter</div>
                  </div>
                </div>
              </div>

              {/* Bottom: simple mock timeline / cards */}
              <div className="relative mt-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),_transparent_60%)] opacity-60 dark:opacity-70" />
                <div className="relative grid grid-cols-2 gap-4 text-xs">
                  <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 flex flex-col gap-1 dark:border-slate-700/70 dark:bg-slate-900/80">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.7rem] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-500">
                        Realtime feed
                      </span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </div>
                    <p className="mt-1 text-slate-700 text-[0.82rem] dark:text-slate-200">
                      High‑value payouts cleared with no delays.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 flex flex-col gap-1 dark:border-slate-700/70 dark:bg-slate-900/80">
                    <span className="text-[0.7rem] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-500">
                      Risk signals
                    </span>
                    <p className="mt-1 text-slate-700 text-[0.82rem] dark:text-slate-200">
                      Anomaly detection keeps fraud attempts in check.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 col-span-2 flex items-center justify-between dark:border-slate-700/70 dark:bg-slate-900/80">
                    <div>
                      <p className="text-[0.8rem] text-slate-700 dark:text-slate-300">
                        Log in once. Stay in sync across tabs.
                      </p>
                      <p className="text-[0.7rem] text-slate-500 mt-1">
                        SSO-ready & cross‑tab session awareness.
                      </p>
                    </div>
                    <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-[0.7rem] text-emerald-700 border border-emerald-400/40 dark:text-emerald-300 dark:border-emerald-400/30">
                      Secure by design
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Theme switcher floating (for smaller screens) */}
        <div className="fixed bottom-4 left-4 z-40 lg:hidden">
          <ThemeSwitcher />
        </div>

        {/* Global notification manager */}
        <NotificationManager />
      </div>
    </>
  );
}

export default Main;
