/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-undef */
import '@/assets/css/vendors/simplebar.css';
import '@/assets/css/themes/echo.css';
import { Transition } from 'react-transition-group';
import Breadcrumb from '@/components/Base/Breadcrumb';
import { useState, useEffect, createRef, useCallback, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { setActiveMenuWithReset } from '@/redux-toolkit/slices/common/sideMenu/sideMenuSlice';
import { selectSideMenu } from '@/redux-toolkit/slices/common/sideMenu/sideMenuSelectors';
import { setCompactMenu as setCompactMenuStore } from '@/redux-toolkit/slices/common/compactMenu/compactMenuSlice';
import { selectCompactMenu } from '@/redux-toolkit/slices/common/compactMenu/compactMenuSelectors';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { FormattedMenu, linkTo, nestedMenu, enter, leave } from './side-menu';
import Lucide from '@/components/Base/Lucide';
import users from '@/assets/images/users/users.svg';
import clsx from 'clsx';
import SimpleBar from 'simplebar';
import { useAuth } from '@/components/context/AuthContext';
import {
  logout,
  onload,
  loginFailure,
  clearError,
} from '@/redux-toolkit/slices/auth/authSlice';
import {
  changePassword,
  logOutUser,
  verifyPassword,
  getCompanyDetails,
} from '@/redux-toolkit/slices/auth/authAPI';
import { setActiveTab } from '@/redux-toolkit/slices/common/tabs/tabSlice';
import {
  ChangePasswordFormFields,
  Role,
  Status,
  VerificationformFields,
} from '@/constants';
import Modal from '../../components/Modal/modals';
import DynamicForm from '@/components/CommonForm';
import { getAllMerchants } from '@/redux-toolkit/slices/merchants/merchantAPI';
import { triggerCrossTabLogout } from '@/utils/crossTabAuthSync';
import { getPaginationData } from '@/redux-toolkit/slices/common/params/paramsSelector';
// import { setIsSocketHit } from '@/redux-toolkit/slices/notification/notificationSlice';
// import { getNotificationsCount } from '@/redux-toolkit/slices/notification/notificationAPI';
// import {
//   // selectNotificationsCount,
//   // selectIsSocketHit,
// } from '@/redux-toolkit/slices/notification/notificationSelector';
import { getUsersById } from '@/redux-toolkit/slices/user/userAPI';
import { addAllNotification } from '@/redux-toolkit/slices/AllNoti/allNotifications';
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Utility to build breadcrumb path from active menu
const buildBreadcrumbPath = (menuItems: Array<FormattedMenu | string>) => {
  const path: { title: string; to: string; active: boolean }[] = [];

  // Always start with Dashboard as the root
  path.push({ title: 'Home', to: '/auth/dashboard', active: false });

  const findActiveMenu = (
    items: Array<FormattedMenu | string>,
    currentPath: string[] = [],
  ) => {
    for (const item of items) {
      if (typeof item === 'string') continue;

      if (item.active) {
        path.push({
          title: item.title,
          to: item.pathname || currentPath.join('/'),
          active: true,
        });
        return true;
      }

      if (item.subMenu && item.activeDropdown) {
        const found = findActiveMenu(item.subMenu, [
          ...currentPath,
          item.pathname || '',
        ]);
        if (found) {
          if (!path.some((p) => p.title === item.title)) {
            path.splice(path.length - 1, 0, {
              title: item.title,
              to: item.pathname || currentPath.join('/'),
              active: false,
            });
          }
          return true;
        }
      }
    }
    return false;
  };

  findActiveMenu(menuItems);
  return path.length > 1
    ? path
    : [{ title: 'Dashboard', to: '/auth/dashboard', active: true }];
};

function Main() {
  const dispatch = useAppDispatch();
  // const isRefreshCount = useAppSelector(selectIsSocketHit);
  // const notificationsCount = useAppSelector(selectNotificationsCount);
  const { setToken } = useAuth();
  const compactMenu = useAppSelector(selectCompactMenu);
  const setCompactMenu = (val: boolean) => {
    localStorage.setItem('compactMenu', val.toString());
    dispatch(setCompactMenuStore(val));
  };
  const [isSidebarFixed, setIsSidebarFixed] = useState(
    localStorage.getItem('isSidebarFixed') === 'true',
  );
  // const [compactMenuOnHover, setCompactMenuOnHover] = useState(false);
  // const [activeMobileMenu, setActiveMobileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [formattedMenu, setFormattedMenu] = useState<
    Array<FormattedMenu | string>
  >([]);
  const sideMenuStore = useAppSelector(selectSideMenu);
  const sideMenu = () => nestedMenu(sideMenuStore || [], location);
  const scrollableRef = createRef<HTMLDivElement>();
  const [topBarActive, setTopBarActive] = useState(false);
  const userData = JSON.parse(localStorage.getItem('userData') || '{}') || {
    name: 'Guest',
    designation: 'N/A',
  };
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [apiKey, setApiKey] = useState('your-api-key');
  const [isBlurred, setIsBlurred] = useState(true);
  const pagination = useAppSelector(getPaginationData);
  const [verification, setVerification] = useState(false);
  const [, setVerified] = useState(false);
  const [showPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData] = useState<FormData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const verificationModalRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  // const [companyName, setCompanyName] = useState<string>('');
  const [uniqueId, setUniqueId] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const toggleBlur = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (isBlurred) {
      if (userData?.designation === Role.ADMIN) {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (userData?.designation === Role.ADMIN) {
          const userInfo = await getUsersById(userData?.userId);
          if (userInfo[0]) {
            setUniqueId(userInfo?.[0]?.config?.unique_admin_id || '');
          }
        }
      }
      if (userData?.designation === Role.MERCHANT) {
        const queryString = new URLSearchParams({
          page: (pagination?.page || 1).toString(),
          limit: (pagination?.limit || 10).toString(),
        }).toString();
        const response = await getAllMerchants(queryString);
        setApiKey(response?.merchants[0].config?.keys?.private || '');
      }
    } else {
      setApiKey('your-api-key');
    }
    setIsBlurred(!isBlurred);
  };

  // const displayNotificationCount = useCallback(
  //   debounce(async () => {
  //     try {
  //       const count = await getNotificationsCount();
  //       dispatch(setNotificationsCount(count));
  //       dispatch(setIsSocketHit(false));
  //     } catch (error) {
  //       console.error('Failed to fetch notifications count', error);
  //     }
  //   }, 500),
  //   [dispatch],
  // );
  // useEffect(() => {
  // displayNotificationCount();
  //   if (isRefreshCount) {
  //     dispatch(setIsSocketHit(false));
  //   }
  // }, [isRefreshCount, dispatch]);

  const handleChangePassword = async (data: {
    password: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    setIsLoading(true);
    let payload = {
      oldPassword: data.password,
      password: data.newPassword,
    };
    try {
      const response = await changePassword(payload);
      if (response?.meta?.message) {
        setShowChangePasswordModal(false);
        dispatch(
          addAllNotification({
            status: Status.SUCCESS,
            message: response?.meta?.message,
          }),
        );
      } else {
        setPasswordError('Failed to change password');
      }
      if (response?.error?.message) {
        setPasswordError('Failed to change password');
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: response?.error?.message,
          }),
        );
      }
    } catch {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
          message: 'An error occurred while changing password',
        }),
      );
      setPasswordError('An error occurred while changing password');
    } finally {
      setIsLoading(false);
    }
  };

  //background click
  // const handleBackgroundClick = (event: React.MouseEvent) => {
  //   event.preventDefault();
  //   if (activeMobileMenu) {
  //     setActiveMobileMenu(false);
  //   }
  // };

  // Initialize states from localStorage
  useEffect(() => {
    const storedCompactMenu = localStorage.getItem('compactMenu');
    if (storedCompactMenu !== null && !isSidebarFixed) {
      setCompactMenu(storedCompactMenu === 'true');
    }
  }, [isSidebarFixed]);

  // Persist isSidebarFixed to localStorage
  useEffect(() => {
    localStorage.setItem('isSidebarFixed', isSidebarFixed.toString());
  }, [isSidebarFixed]);

  useEffect(() => {
    const storedCompanyName = localStorage.getItem('companyName');
    if (storedCompanyName) {
      // setCompanyName(storedCompanyName);
    }
  }, []);

  // Modified useEffect to fetch company details
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const parsedUserData = JSON.parse(storedUserData);
      const currentDesignation = parsedUserData.designation;
      const currentRole = parsedUserData.role;

      if (parsedUserData?.companyId) {
        const fetchCompanyDetails = async () => {
          try {
            const companyDetails = await getCompanyDetails(
              parsedUserData.companyId,
            );
            if (companyDetails?.data) {
              if (currentDesignation === Role.ADMIN) {
                localStorage.setItem(
                  'companyName',
                  companyDetails.data[0].full_name,
                );
                // setCompanyName(companyDetails.data[0].full_name);
              }
              if (companyDetails.data[0]?.allowpayassist) {
                localStorage.setItem(
                  'allowPayAssist',
                  companyDetails.data[0].allowpayassist.toString(),
                );
              }
              if (companyDetails.data[0]?.allowtatapay) {
                localStorage.setItem(
                  'allowTataPay',
                  companyDetails.data[0].allowtatapay.toString(),
                );
              }
              if (companyDetails.data[0]?.allow_clickrr) {
                localStorage.setItem(
                  'allowClickrr',
                  companyDetails.data[0].allow_clickrr.toString(),
                );
              } 
            } 
          } catch {
            // Handle error silently
          }
        };
        if ([Role.ADMIN, Role.VENDOR, Role.SUB_VENDOR ,Role.VENDOR_ADMIN].includes(currentRole || '')) {
          fetchCompanyDetails();
        }
      }
    }
  }, []);

  // const toggleSidebarMode = (event: React.MouseEvent) => {
  //   event.preventDefault();
  //   const newFixedState = !isSidebarFixed;
  //   setIsSidebarFixed(newFixedState);
  //   if (!newFixedState) {
  //     const storedCompactMenu = localStorage.getItem('compactMenu');
  //     setCompactMenu(storedCompactMenu === 'true' || window.innerWidth <= 1600);
  //   }
  // };

  const compactLayout = () => {
    if (!isSidebarFixed) {
      if (window.innerWidth <= 1600) {
        setCompactMenu(true);
      } else {
        const storedCompactMenu = localStorage.getItem('compactMenu');
        setCompactMenu(storedCompactMenu === 'true');
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  //useEffect to change inbuilt height of simplebar by removing simplerbar-placeholder
  //sidebar scrollable due to increased height which isoccuring due to  in-build placeholder component in simplebar imported from simplebar
  useEffect(() => {
    const observer = new MutationObserver(() => {
      //MutationObserver is a built-in JavaScript API that lets you watch for changes in the DOM
      const placeholder = document.querySelector('.simplebar-placeholder');
      //It’s useful when DOM elements are inserted dynamically after page load, like in your case with .simplebar-placeholder
      if (placeholder) {
        placeholder.remove();
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      //Watch the entire DOM tree, and if any elements are added or removed anywhere inside, call the mutation callback
      childList: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let simpleBarInstance: SimpleBar | null = null;
    if (scrollableRef.current) {
      simpleBarInstance = new SimpleBar(scrollableRef.current);
    }

    setFormattedMenu(sideMenu());
    compactLayout();

    const debouncedCompactLayout = debounce(compactLayout, 100);
    window.addEventListener('resize', debouncedCompactLayout);

    return () => {
      window.removeEventListener('resize', debouncedCompactLayout);
      if (simpleBarInstance) {
        simpleBarInstance.unMount();
      }
    };
  }, [sideMenuStore, location, isSidebarFixed]);

  const HandleLogOut = useCallback(async () => {
    dispatch(onload({ load: true }));
    dispatch(clearError());
    const session_id = localStorage.getItem('userSession');
    if (!session_id) {
      dispatch(
        loginFailure({
          error: {
            message: 'Session ID is missing',
            name: 'Error',
            statusCode: 400,
          },
        }),
      );
      return;
    }
    const logOutUserInfo = await logOutUser({ session_id });
    if (logOutUserInfo) {
      // Trigger cross-tab logout before local logout
      triggerCrossTabLogout('User initiated logout');

      dispatch(logout());
      dispatch(setActiveTab(0));
      setToken(null);
      navigate('/');
    } else {
      dispatch(
        loginFailure({
          error: {
            message: 'An error occurred',
            name: 'Error',
            statusCode: 500,
          },
        }),
      );
    }
  }, [dispatch]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        document.body.scrollTop > 0 ||
        document.documentElement.scrollTop > 0
      ) {
        setTopBarActive(true);
      } else {
        setTopBarActive(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track fullscreen state changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);
  // background click functionality
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const dropdown = document.querySelector('.dropdown');
      const button = document.querySelector('.profile-button');
      const modalContent = document.querySelector(
        '.verification-modal-content',
      );
      if (
        isOpen &&
        dropdown &&
        button &&
        !dropdown.contains(event.target as Node) &&
        !button.contains(event.target as Node) &&
        !(
          verification &&
          modalContent &&
          modalContent.contains(event.target as Node)
        )
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, verification]);

  // Determine if sidebar is expanded
  // const isSidebarExpanded =
  //   isSidebarFixed || !compactMenu || (compactMenu && compactMenuOnHover);

  // Build dynamic breadcrumb path
  const breadcrumbPath = buildBreadcrumbPath(formattedMenu);

  const handleVerificationClick = (event: React.MouseEvent) => {
    event.preventDefault();
    setVerification(true);
  };

  const handleVerification = async (passwordData: { password: string }) => {
    setIsLoading(true);
    try {
      setErrorMessage(null);
      const response = await verifyPassword(passwordData.password);
      setVerified(response);
      toggleBlur(event as unknown as React.MouseEvent);
      setVerification(false);
    } catch {
      setErrorMessage('Invalid details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className={clsx([
          'echo group bg-white min-h-screen relative',
          topBarActive && 'background--hidden',
        ])}
      >
        <div
          className={clsx([
            'fixed top-0 left-0 z-50 h-full bg-white shadow-lg transition-transform duration-300',
            isSidebarFixed ? 'translate-x-0' : '-translate-x-full',
          ])}
          style={{
            width: '275px',
            overflowY: 'auto', // Enable vertical scrolling
            maxHeight: '100vh', // Ensure it doesn't exceed the viewport height
          }}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-4 py-4 bg-gray-100 shadow-md">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full">
                <Lucide icon="Home" className="w-6 h-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-semibold text-gray-800">ZoloPay</span>
            </div>
            <button
              className="p-2 rounded-full hover:bg-gray-200"
              onClick={() => setIsSidebarFixed(false)}
            >
              <Lucide icon="X" className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Sidebar Menu */}
          <div className="overflow-y-auto">
            <ul className="space-y-2">
              {formattedMenu.length > 0 ? (
                formattedMenu.map((menu, menuKey) =>
                  typeof menu === 'string' ? (
                    <li
                      className="text-gray-400 uppercase text-xs font-semibold px-4 py-2"
                      key={menuKey}
                    >
                      {menu}
                    </li>
                  ) : (
                    <li key={menuKey}>
                      <a
                        href=""
                        className={clsx([
                          'flex items-center px-4 py-3 rounded-lg transition-all duration-200',
                          menu.active
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-700 hover:bg-gray-100',
                        ])}
                        onClick={(event: React.MouseEvent) => {
                          event.preventDefault();
                          if (menu.pathname && !menu.subMenu) {
                            dispatch(setActiveMenuWithReset(menu.pathname));
                          }
                          linkTo(menu, navigate);
                          setFormattedMenu([...formattedMenu]);
                          // setActiveMobileMenu(false);
                        }}
                      >
                        <Lucide
                          icon={menu.icon || 'Circle'}
                          className="w-5 h-5 mr-3"
                        />
                        <span className="truncate">{menu.title}</span>
                        {menu.subMenu && (
                          <Lucide
                            icon="ChevronDown"
                            className="ml-auto w-4 h-4 transition-transform duration-200"
                          />
                        )}
                      </a>
                      {menu.subMenu && (
                        <Transition
                          in={menu.activeDropdown}
                          onEnter={enter}
                          onExit={leave}
                          timeout={300}
                        >
                          <ul className="pl-8 space-y-2">
                            {menu.subMenu.map((subMenu, subMenuKey) => (
                              <li key={subMenuKey}>
                                <a
                                  href=""
                                  className={clsx([
                                    'flex items-center px-4 py-2 rounded-lg transition-all duration-200',
                                    subMenu.active
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'text-gray-600 hover:bg-gray-100',
                                  ])}
                                  onClick={(event: React.MouseEvent) => {
                                    event.preventDefault();
                                    if (subMenu.pathname && !subMenu.subMenu) {
                                      dispatch(
                                        setActiveMenuWithReset(subMenu.pathname),
                                      );
                                    }
                                    linkTo(subMenu, navigate);
                                    setFormattedMenu([...formattedMenu]);
                                  }}
                                >
                                  <Lucide
                                    icon={subMenu.icon || 'Circle'}
                                    className="w-4 h-4 mr-3"
                                  />
                                  <span className="truncate">{subMenu.title}</span>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </Transition>
                      )}
                    </li>
                  ),
                )
              ) : (
                <li className="text-gray-500 text-center py-4">
                  No menu items available
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Sidebar Toggle Button */}
        {!isSidebarFixed && (
          <button
            className="fixed top-4 left-4 z-50 p-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600"
            onClick={() => setIsSidebarFixed(true)}
          >
            <Lucide icon="Menu" className="w-6 h-6" />
          </button>
        )}
        <div
          className={clsx([
            'absolute h-[65px] transition-[margin] duration-300 mt-3.5 inset-x-0 top-0 z-[60] bg-white shadow-md',
            isSidebarFixed && 'xl:ml-[275px]',
            !isSidebarFixed && !compactMenu && 'xl:ml-[275px]',
            !isSidebarFixed &&
              compactMenu &&
              // !compactMenuOnHover &&
              'xl:ml-[91px]',
            !isSidebarFixed &&
              compactMenu &&
              // compactMenuOnHover &&
              'xl:ml-[275px]',
          ])}
        >
          <div className="flex items-center justify-between h-full px-5">
            {/* Left Section: Breadcrumb */}
            <div className="flex items-center space-x-4">
              <Breadcrumb light className="truncate">
                {breadcrumbPath.map((item, index) => (
                  <Breadcrumb.Link
                    key={index}
                    className="text-gray-600 hover:text-blue-500 transition-colors"
                    to={item.to}
                    active={item.active}
                  >
                    {item.title}
                  </Breadcrumb.Link>
                ))}
              </Breadcrumb>
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center space-x-4">
              {/* Fullscreen Toggle */}
              <button
                className="p-2 rounded-full hover:bg-gray-100 transition"
                onClick={(e) => {
                  e.preventDefault();
                  toggleFullscreen();
                }}
                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                <Lucide
                  icon={isFullscreen ? 'Minimize2' : 'Maximize2'}
                  className="w-5 h-5 text-gray-600"
                />
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleDropdown();
                  }}
                >
                  <img
                    alt="Profile"
                    src={users || 'https://via.placeholder.com/36'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="hidden sm:block text-gray-700 font-medium">
                    {userData.name || 'Guest'}
                  </span>
                </button>
                {isOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-50">
                    <div className="p-4 border-b">
                      <p className="text-sm font-medium text-gray-700">
                        {userData.name || 'Guest'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {userData.designation}
                      </p>
                    </div>
                    <div className="py-2">
                    {userData.designation === Role.ADMIN && (
                          <div className="flex items-center space-x-3">
                            <span>Unique ID:</span>
                            <span
                              className={`block text-xs text-gray-500 dark:text-gray-400 ${
                                isBlurred ? 'blur-sm' : ''
                              } transition-all duration-300`}
                            >
                              {uniqueId || 'N/A'}
                            </span>
                            <button className="focus:outline-none">
                              {isBlurred ? (
                                <Lucide
                                  className="stroke-[1]"
                                  icon="Eye"
                                  onClick={handleVerificationClick}
                                />
                              ) : (
                                <Lucide
                                  className="stroke-[1]"
                                  icon="EyeOff"
                                  onClick={toggleBlur}
                                />
                              )}
                            </button>
                          </div>
                        )}
                        {[Role.MERCHANT, Role.SUB_MERCHANT].includes(
                          userData.designation || '',
                        ) && (
                          <div className="flex items-center space-x-3 mt-2">
                            <span>API Key:</span>
                            <span
                              className={`block text-xs text-gray-500 dark:text-gray-400 ${
                                isBlurred ? 'blur-sm' : ''
                              } transition-all duration-300`}
                            >
                              {apiKey}
                            </span>
                            <button className="focus:outline-none">
                              {isBlurred ? (
                                <Lucide
                                  className="stroke-[1]"
                                  icon="Eye"
                                  onClick={handleVerificationClick}
                                />
                              ) : (
                                <Lucide
                                  className="stroke-[1]"
                                  icon="EyeOff"
                                  onClick={toggleBlur}
                                />
                              )}
                            </button>
                          </div>
                        )}
                  </div>
                  <hr />
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setShowChangePasswordModal(true);
                          setIsOpen(false);
                        }}
                      >
                        <Lucide
                          icon="KeyRound"
                          className="w-4 h-4 inline-block mr-2"
                        />
                        Change Password
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          HandleLogOut();
                          setIsOpen(false);
                        }}
                      >
                        <Lucide
                          icon="LogOut"
                          className="w-4 h-4 inline-block mr-2"
                        />
                        Logout
                      </button>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <Modal
          handleModal={() => setShowChangePasswordModal(false)}
          forOpen={showChangePasswordModal}
          title=""
        >
          <DynamicForm
            sections={ChangePasswordFormFields}
            onSubmit={handleChangePassword}
            defaultValues={{
              password: '',
              newPassword: '',
              confirmPassword: '',
            }}
            isEditMode={false}
            handleCancel={() => setShowChangePasswordModal(false)}
            isLoading={isLoading}
          />
          {passwordError && (
            <div className="text-danger text-sm mt-2">{passwordError}</div>
          )}
        </Modal>
        {/* added ref for backgroundclick handling in evrification modal */}
        <div
          className="verification-modal"
          ref={verificationModalRef}
          style={{ zIndex: 200 }}
        >
          <Modal
            handleModal={() => setVerification(false)}
            forOpen={verification}
          >
            <div
              className="verification-modal-content"
              onClick={(event) => event.stopPropagation()}
            >
              <DynamicForm
                sections={VerificationformFields(showPassword)}
                onSubmit={handleVerification}
                defaultValues={formData || {}}
                isEditMode={formData ? true : false}
                handleCancel={() => setVerification(false)}
                isLoading={isLoading}
              />
              {errorMessage && (
                <p className="px-4 text-red-500 text-md mt-2">{errorMessage}</p>
              )}
            </div>
          </Modal>
        </div>
        <div
          className={clsx([
            'transition-[margin,width] duration-100 xl:pl-3.5 pt-[54px] pb-16 relative z-10 group',
            { 'xl:ml-[275px]': !compactMenu || isSidebarFixed },
            { 'xl:ml-[91px]': compactMenu && !isSidebarFixed },
          ])}
        >
          <div className="px-2 mt-16 w-full">
            <div className="max-w-full 2xl:max-w-[1920px] mx-auto">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Main;
