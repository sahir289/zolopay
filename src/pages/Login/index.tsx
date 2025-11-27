/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
// import { FormCheck, FormInput, FormLabel } from '@/components/Base/Form';
// import Tippy from "@/components/Base/Tippy";
// import users from "@/fakers/users";
// import Button from '@/components/Base/Button';
import { getShortBuildInfo } from '@/utils/buildInfo';
// import clsx from 'clsx';
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
// import Lucide from '@/components/Base/Lucide';
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
import './login.css';
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
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>{isLoginFirst ? 'Change Password' : 'Welcome Back!'}</h1>
          <p>{isLoginFirst ? 'Update your password to continue.' : 'Log in to your account'}</p>
        </div>
        {showForgotPassword ? (
          <ForgotPassword
            onBack={() => setShowForgotPassword(false)}
            onSuccess={() => setShowForgotPassword(false)}
          />
        ) : (
          <form onSubmit={handleForm} className="login-form">
            {!isLoginFirst && (
              <>
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={loginObj.username}
                  onChange={(e) => {
                    getUserRole(e.target.value);
                    updateFormValue({ updateType: 'username', value: e.target.value });
                  }}
                  required
                />
                {userRoleError && <p className="error-text">{userRoleError}</p>}
                <label htmlFor="password">Password</label>
                <div className="password-container">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={loginObj.password}
                    onChange={(e) =>
                      updateFormValue({ updateType: 'password', value: e.target.value })
                    }
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {loginObj.isAdminLogin && (
                  <>
                    <label htmlFor="unique-id">Unique ID</label>
                    <input
                      id="unique-id"
                      type="text"
                      placeholder="Enter unique ID"
                      value={loginObj.uniqueId}
                      onChange={(e) =>
                        updateFormValue({ updateType: 'uniqueId', value: e.target.value })
                      }
                      required
                    />
                  </>
                )}
                <div className="checkbox-container">
                  <label>
                    <input
                      type="checkbox"
                      checked={loginObj.rememberMe}
                      onChange={(e) =>
                        updateFormValue({ updateType: 'rememberMe', value: e.target.checked })
                      }
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    className="forgot-password"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot Password?
                  </button>
                </div>
              </>
            )}
            {isLoginFirst && (
              <>
                <label htmlFor="new-password">New Password</label>
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={passwords.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  required
                />
                <label htmlFor="confirm-password">Confirm New Password</label>
                <input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={passwords.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  required
                />
                {passwordError && <p className="error-text">{passwordError}</p>}
              </>
            )}
            <button type="submit" className="login-button" disabled={userLogin.loading || isButtonDisabled}>
              {userLogin.loading ? 'Loading...' : isLoginFirst ? 'Update Password' : 'Log In'}
            </button>
          </form>
        )}
      </div>
      <div className="fixed bottom-4 right-4 z-50 text-sm text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-darkmode-600/80 px-3 py-1.5 rounded-lg shadow-sm backdrop-blur-sm">
        {getShortBuildInfo()}
      </div>
      <ThemeSwitcher />
      <NotificationManager />
    </div>
  );
}

export default Main;
