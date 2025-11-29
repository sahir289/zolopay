import { NavigateFunction } from "react-router-dom";
import { Menu } from "@/redux-toolkit/slices/common/sideMenu/sideMenuSlice";
import { slideUp, slideDown } from "@/utils/helper";
import { Role } from "@/constants";

interface Location {
  pathname: string;
  search: string;
  forceActiveMenu?: string;
}

export interface FormattedMenu extends Menu {
  active?: boolean;
  activeDropdown?: boolean;
  subMenu?: FormattedMenu[];
}

// Setup side menu
const findActiveMenu = (subMenu: Menu[], location: Location): boolean => {
  let match = false;
  subMenu.forEach((item) => {
    if (
      ((location.forceActiveMenu !== undefined &&
        item.pathname === location.forceActiveMenu) ||
        (location.forceActiveMenu === undefined &&
          item.pathname === location.pathname + location.search)) &&
      !item.ignore
    ) {
      match = true;
    } else if (!match && item.subMenu) {
      match = findActiveMenu(item.subMenu, location);
    }
  });
  return match;
};

const nestedMenu = (menu: Array<Menu | string>, location: Location) => {
  // Fetch the role dynamically from localStorage
  const data = localStorage.getItem("userData");
  let role: keyof typeof Role | null = null;

  if (data) {
    try {
      const parsedData = JSON.parse(data);
      role = parsedData.role || null;
    } catch (error) {
      console.error("Failed to parse userData from localStorage:", error);
    }
  }

  // Log a warning if role is null
  if (!role) {
    console.warn("Role is null in side menu. Ensure userData is set correctly.");
  }

  const formattedMenu: Array<FormattedMenu | string> = [];
  menu.forEach((item) => {
    if (typeof item !== "string") {
      const menuItem: FormattedMenu = {
        icon: item.icon,
        title: item.title,
        badge: item.badge,
        pathname: item.pathname,
        subMenu: item.subMenu,
        ignore: item.ignore,
        activeDropdown: false, // Default to closed
        active: false, // Default to not active
      };

      // Determine if the menu item is active
      menuItem.active =
        ((location.forceActiveMenu !== undefined &&
          menuItem.pathname === location.forceActiveMenu) ||
          (location.forceActiveMenu === undefined &&
            menuItem.pathname === location.pathname + location.search) ||
          (menuItem.subMenu && findActiveMenu(menuItem.subMenu, location))) &&
        !menuItem.ignore;

      // Open the submenu if the menu item is active
      if (menuItem.active && menuItem.subMenu) {
        menuItem.activeDropdown = true;
      }

      if (menuItem.subMenu) {
        // Recursively process nested submenus
        const subMenu: Array<FormattedMenu> = [];
        nestedMenu(menuItem.subMenu, location).map((subItem) => {
          if (typeof subItem !== "string") {
            subMenu.push(subItem);
          }
        });
        menuItem.subMenu = subMenu;
      }

      // Example: Add submenus under "Dashboard"
      if (menuItem.title === "Dashboard") {
        menuItem.subMenu = [
          ...(Role.MERCHANT === role || Role.ADMIN === role || Role.SUB_MERCHANT === role || Role.TRANSACTIONS === role || Role.OPERATIONS === role
            ? [{
                title: "Merchant Dashboard",
                pathname: "/auth/dashboard/merchant",
                icon: "TrendingUp" as "BarChart",
              }]
            : []),
          ...(Role.VENDOR === role || Role.ADMIN === role || Role.SUB_VENDOR === role || Role.TRANSACTIONS === role || Role.OPERATIONS === role
            ? [{
                title: "Vendor Dashboard",
                pathname: "/auth/dashboard/vendor",
                icon: "LineChart" as "BarChart2",
              }]
            : []),
        ];
        menuItem.activeDropdown = false;
      }

      if (menuItem.title === "Transactions") {
        menuItem.subMenu = [
          {
            title: "Payin Transactions",
            icon: "ArrowDownCircle" as const,
            subMenu: [
              {
                title: "All",
                pathname: "/auth/transaction-list/payins/all",
                icon: "List" as const
              },
              {
                title: "Completed",
                pathname: "/auth/transaction-list/payins/completed",
                icon: "CheckCircle2" as const
              },
              {
                title: "In Progress",
                pathname: "/auth/transaction-list/payins/in-progress",
                icon: "Clock" as const
              },
              {
                title: "Dropped",
                pathname: "/auth/transaction-list/payins/dropped",
                icon: "XOctagon" as const
              },
              {
                title: "Review",
                pathname: "/auth/transaction-list/payins/review",
                icon: "AlertTriangle" as const
              },
            ]
          },
          {
            title: "Payout Transactions",
            icon: "ArrowUpCircle" as const,
            subMenu: [
              {
                title: "All",
                pathname: "/auth/transaction-list/payouts/all",
                icon: "List" as const
              },
              {
                title: "Completed",
                pathname: "/auth/transaction-list/payouts/completed",
                icon: "CheckCircle2" as const
              },
              {
                title: "In Progress",
                pathname: "/auth/transaction-list/payouts/in-progress",
                icon: "Clock" as const
              },
              {
                title: "Rejected",
                pathname: "/auth/transaction-list/payouts/rejected",
                icon: "ShieldX" as const
              },
            ]
          },
        ];
        menuItem.activeDropdown = false;
      }

      if (menuItem.title === "Settlements") {
        menuItem.subMenu = [
          ...Role.MERCHANT === role || Role.ADMIN === role || Role.SUB_MERCHANT === role || Role.TRANSACTIONS === role || Role.OPERATIONS === role
            ? [{
            title: "Merchant Settlements",
            pathname: "/auth/settlement/merchants",
            icon: "Coins" as const,
            }]
            : [],
          ...Role.VENDOR === role || Role.ADMIN === role || Role.SUB_VENDOR === role || Role.TRANSACTIONS === role || Role.OPERATIONS === role
            ? [{
            title: "Vendor Settlements",
            pathname: "/auth/settlement/vendors",
            icon: "Wallet" as const,
            }]
            : [],
        ];
        menuItem.activeDropdown = false;
      }

      if (menuItem.title === "Reports") {
        menuItem.subMenu = [
          ...Role.MERCHANT === role || Role.ADMIN === role || Role.SUB_MERCHANT === role || Role.TRANSACTIONS === role || Role.OPERATIONS === role
            ? [{
            title: "Merchant Reports",
            pathname: "/auth/reports/merchants",
            icon: "FileBarChart" as const,
            }]
            : [],
          ...Role.VENDOR === role || Role.ADMIN === role || Role.SUB_VENDOR === role || Role.TRANSACTIONS === role || Role.OPERATIONS === role
            ? [{
            title: "Vendor Reports",
            pathname: "/auth/reports/vendors",
            icon: "FileSpreadsheet" as const, 
            }]
            : [],
        ];
        menuItem.activeDropdown = false;
      }
      if (menuItem.title === "BeneficiaryAccounts") {
        menuItem.subMenu = [
          ...Role.MERCHANT === role || Role.ADMIN === role || Role.SUB_MERCHANT === role || Role.TRANSACTIONS === role || Role.OPERATIONS === role
            ? [{
            title: "Merchant",
            pathname: "/auth/beneficiaryaccounts/merchants",
            icon: "User" as const,
            }]
            : [],
          ...Role.VENDOR === role || Role.ADMIN === role || Role.SUB_VENDOR === role || Role.TRANSACTIONS === role || Role.OPERATIONS === role
            ? [{
            title: "Vendor",
            pathname: "/auth/beneficiaryaccounts/vendors",
            icon: "Users" as const,
            }]
            : [],
        ];
        menuItem.activeDropdown = false;
      }

      if (menuItem.title === "Clients") {
        menuItem.subMenu = [
          ...Role.MERCHANT === role || Role.ADMIN === role || Role.SUB_MERCHANT === role || Role.TRANSACTIONS === role || Role.OPERATIONS === role
            ? [{
            title: "Merchant",
            pathname: "/auth/clients/merchants",
            icon: "Store" as const,
            }]
            : [],
          ...Role.VENDOR === role || Role.ADMIN === role || Role.SUB_VENDOR === role || Role.TRANSACTIONS === role || Role.OPERATIONS === role
            ? [{
            title: "Vendor",
            pathname: "/auth/clients/vendors",
            icon: "Building" as const,
            }]
            : [],
        ];
        menuItem.activeDropdown = false;
      }

      if (menuItem.title === "Bank Details") {
        menuItem.subMenu = [
          {
            title: "Payin Accounts",
            pathname: "/auth/bankaccounts/payins",
            icon: "ArrowDown",
          },
          {
            title: "Payout Accounts",
            pathname: "/auth/bankaccounts/payouts",
            icon: "ArrowUp",
          },
        ];
        menuItem.activeDropdown = false;
      }

      formattedMenu.push(menuItem);
    } else {
      formattedMenu.push(item);
    }
  });

  return formattedMenu;
};

const linkTo = (menu: FormattedMenu, navigate: NavigateFunction) => {
  menu.activeDropdown = !menu.activeDropdown;
  if (menu.subMenu) {
    // menu.activeDropdown = !menu.activeDropdown;
  } else {
    if (menu.pathname !== undefined) {
      navigate(menu.pathname);
    }
  }
};

const enter = (el: HTMLElement) => {
  slideDown(el, 300);
};

const leave = (el: HTMLElement) => {
  slideUp(el, 300);
};

export { nestedMenu, linkTo, enter, leave };