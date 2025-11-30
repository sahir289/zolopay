import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { icons } from "@/components/Base/Lucide";
import { Role } from "@/constants";
import { resetTabs } from "../tabs/tabSlice";

export interface Menu {
  icon: keyof typeof icons;
  title: string;
  badge?: number;
  pathname?: string;
  subMenu?: Menu[];
  ignore?: boolean;
}

export interface SideMenuState {
  menu: Array<Menu | string>;
  activeMenu: string | null;
}

const getUserRoleFromStorage = (): keyof typeof Role | undefined => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    return userData?.designation;
};

const generateMenuForRole = (role?: keyof typeof Role): Array<Menu | string> => {
  const baseMenu = [
    "OVERVIEW",
    {
      icon: "LayoutGrid" as keyof typeof icons,
      pathname: "/auth/dashboard",
      title: "Overview",
    },
    "PAYMENTS",
    {
      icon: "CreditCard" as keyof typeof icons,
      pathname: "/auth/transaction-list",
      title: "Payments",
    }
  ];

  const settlements_chargebacks = [
    "SETTLEMENTS",
    {
      icon: "FileText" as keyof typeof icons,
      pathname: "/auth/settlement",
      title: "Settlements",
    },
    {
      icon: "Building2" as keyof typeof icons,
      pathname: "/auth/beneficiaryaccounts",
      title: "Payee Accounts",
    },
  ];

  const users_disputes = [
    "TEAM",
    {
      icon: "UsersRound" as keyof typeof icons,
      pathname: "/auth/users",
      title: "Team Members",
    },
    "DISPUTES",
    {
      icon: "RefreshCcw" as keyof typeof icons,
      pathname: "/auth/chargeback",
      title: "Disputes",
    }
  ];


  // const settlements_transactions = [
  //   "SETTLEMENTS",
  //   {
  //     icon: "NotebookText" as keyof typeof icons,
  //     pathname: "/auth/settlement",
  //     title: "Settlements",
  //   },]
//show vendor settlement in vendor operations
  const settlements_vendor_operations = [
    "SETTLEMENTS",
    {
      icon: "FileText" as keyof typeof icons,
      pathname: "/auth/settlement",
      title: "Settlements",
    },
    {
      icon: "Building2" as keyof typeof icons,
      pathname: "/auth/beneficiaryaccounts",
      title: "Payee Accounts",
    },
  ]

  const adminItems = [
    "RECORDS",
    {
      icon: "Database" as keyof typeof icons,
      pathname: "/auth/add-data",
      title: "Records",
    },
    "BANKING",
    {
      icon: "Building2" as keyof typeof icons,
      pathname: "/auth/bankaccounts",
      title: "Banking",
    }
  ];

  // const vendorItems = [
  //   "BANK DETAILS",
  //   {
  //     icon: "Landmark" as keyof typeof icons,
  //     pathname: "/auth/bankaccounts",
  //     title: "Bank Details",
  //   }
  // ];

  // const bankItems = [
  //   "BANK DETAILS",
  //   {
  //     icon: "Landmark" as keyof typeof icons,
  //     pathname: "/auth/bankaccounts",
  //     title: "Bank Details",
  //   }
  // ];
  // const userItems = [
  //   "TEAM",
  //   {
  //     icon: "UsersRound" as keyof typeof icons,
  //     pathname: "/auth/users",
  //     title: "Team Members",
  //   }
  // ];

  const reports = [
    "ANALYTICS",
    {
      icon: "FileBarChart2" as keyof typeof icons,
      pathname: "/auth/reports",
      title: "Analytics",
    },
  ];

  const commonItems = [
    "PARTNERS",
    {
      icon: "Briefcase" as keyof typeof icons,
      pathname: "/auth/clients",
      title: "Partners",
    },
  ];

  switch (role) {
    case Role.ADMIN:
      return [...baseMenu, ...settlements_chargebacks, ...users_disputes, ...adminItems, ...commonItems, ...reports];
    case Role.TRANSACTIONS:
      return [...baseMenu, ...settlements_chargebacks, ...users_disputes, ...adminItems, ...commonItems, ...reports];
    case Role.OPERATIONS:
      return [...baseMenu, ...adminItems];
    case Role.VENDOR:
      return [...baseMenu, ...settlements_chargebacks, ...users_disputes, ...adminItems, ...commonItems, ...reports];
    case Role.SUB_VENDOR:
      return [...baseMenu, ...settlements_chargebacks, ...users_disputes, ...adminItems, ...commonItems, ...reports];
    case Role.VENDOR_ADMIN:
      return [...baseMenu, ...settlements_chargebacks, ...users_disputes, ...adminItems, ...commonItems, ...reports];
    case Role.MERCHANT:
      return [...baseMenu, ...settlements_chargebacks, ...reports];
    case Role.SUB_MERCHANT:
      return [...baseMenu, ...reports];
    case Role.MERCHANT_OPERATIONS:
      return [...baseMenu];
    case Role.VENDOR_OPERATIONS:
      return [...baseMenu, ...settlements_vendor_operations, ...adminItems];
    default:
      return baseMenu;
  }
};

const initialState: SideMenuState = {
  menu: generateMenuForRole(getUserRoleFromStorage()),
  activeMenu: null,
};

export const setActiveMenuWithReset = createAsyncThunk(
  "sideMenu/setActiveMenuWithReset",
  async (pathname: string, { dispatch }) => {
    dispatch(resetTabs());
    return pathname;
  }
);

export const sideMenuSlice = createSlice({
  name: "sideMenu",
  initialState,
  reducers: {
    updateMenu: (state, action: PayloadAction<keyof typeof Role>) => {
      state.menu = generateMenuForRole(action.payload);
    },
    initializeMenu: (state) => {
      const role = getUserRoleFromStorage();
      if (role) {
        state.menu = generateMenuForRole(role);
      }
    },
    setActiveMenu: (state, action: PayloadAction<string>) => {
      state.activeMenu = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setActiveMenuWithReset.fulfilled, (state, action) => {
      state.activeMenu = action.payload;
    });
  },
});

export const { updateMenu, initializeMenu, setActiveMenu } = sideMenuSlice.actions;
export default sideMenuSlice.reducer;