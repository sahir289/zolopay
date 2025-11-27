import { NavigateFunction } from "react-router-dom";
import { Menu } from "@/redux-toolkit/slices/common/sideMenu/sideMenuSlice";
import { slideUp, slideDown } from "@/utils/helper";

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
          {
            title: "Merchant Dashboard",
            pathname: "/auth/dashboard/merchant",
            icon: "BarChart",
          },
          {
            title: "Vendor Dashboard",
            pathname: "/auth/dashboard/vendor",
            icon: "BarChart2",
          },
        ];
        menuItem.activeDropdown = false;
      }

      if (menuItem.title === "Transactions") {
        menuItem.subMenu = [
          {
            title: "Payin Transactions",
            pathname: "/auth/transaction-list/payins",
            icon: "List",
          },
          {
            title: "Payout Transactions",
            pathname: "/auth/transaction-list/payouts",
            icon: "Clock",
          },
        ];
        menuItem.activeDropdown = false;
      }
      if (menuItem.title === "Settlements") {
        menuItem.subMenu = [
          {
            title: "Merchant Settlements",
            pathname: "/auth/settlement/merchants",
            icon: "DollarSign",
          },
          {
            title: "Vendor Settlements",
            pathname: "/auth/settlement/vendors",
            icon: "CreditCard",
          },
        ];
        menuItem.activeDropdown = false;
      }

      if (menuItem.title === "Reports") {
        menuItem.subMenu = [
          {
            title: "Merchant Reports",
            pathname: "/auth/reports/merchants",
            icon: "BarChart",
          },
          {
            title: "Vendor Reports",
            pathname: "/auth/reports/vendors",
            icon: "BarChart2",
          },
        ];
        menuItem.activeDropdown = false;
      }
      console.log("menuItem.title", menuItem.title);
      if (menuItem.title === "BeneficiaryAccounts") {
        menuItem.subMenu = [
          {
            title: "Merchant",
            pathname: "/auth/beneficiaryaccounts/merchants",
            icon: "BarChart",
          },
          {
            title: "Vendor",
            pathname: "/auth/beneficiaryaccounts/vendors",
            icon: "BarChart2",
          },
        ];
        menuItem.activeDropdown = false;
      }

      if (menuItem.title === "Clients") {
        menuItem.subMenu = [
          {
            title: "Merchant",
            pathname: "/auth/clients/merchants",
            icon: "BarChart",
          },
          {
            title: "Vendor",
            pathname: "/auth/clients/vendors",
            icon: "BarChart2",
          },
        ];
        menuItem.activeDropdown = false;
      }

      if (menuItem.title === "Bank Details") {
        menuItem.subMenu = [
          {
            title: "Payin Accounts",
            pathname: "/auth/bankaccounts/payins",
            icon: "BarChart",
          },
          {
            title: "Payout Accounts",
            pathname: "/auth/bankaccounts/payouts",
            icon: "BarChart2",
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
  console.log('menu', menu);
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