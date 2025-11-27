// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/explicit-function-return-type */
// import { Tab } from '@/components/Base/Headless';
// import Lucide from '@/components/Base/Lucide';
// import { useCallback, useEffect, useState } from 'react';
// import { Role } from '@/constants';
// import { getAllCalculations } from '@/redux-toolkit/slices/calculations/calcuationsAPI';
// import { getAllMerchantCodes } from '@/redux-toolkit/slices/merchants/merchantAPI';
// import { getAllVendorCodes } from '@/redux-toolkit/slices/vendor/vendorAPI';
// import { setActiveTab } from '@/redux-toolkit/slices/common/tabs/tabSlice';
// import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
// import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
// import { getTabs } from '@/redux-toolkit/slices/common/tabs/tabSelectors';
// import { selectDarkMode } from '@/redux-toolkit/slices/common/darkMode/darkModeSlice';
// import { extractChartData, getFormattedCurrentDate } from '@/utils/helper';
// // import { withLazyLoading } from '@/utils/lazyStrategies';
// import dayjs from 'dayjs';
// import utc from 'dayjs/plugin/utc';
// import timezone from 'dayjs/plugin/timezone';

// dayjs.extend(utc);
// dayjs.extend(timezone);

// Normal imports instead of lazy loading
import MerchantBoard from '@/pages/DashboardOverview1/MerchantBoard/index';
import VendorBoard from '@/pages/DashboardOverview1/VendorBoard/index';
import Miscellaneous from '@/pages/DashboardOverview1/Miscellaneous/index';
import { getVendorCodes } from '@/redux-toolkit/slices/vendor/vendorSlice';
import DashboardStatCard from '@/components/dashboard-stat-card';

// // Commented out lazy loading approach:
// // const MerchantBoard = withLazyLoading(
// //   () => import('@/pages/DashboardOverview1/MerchantBoard/index'),
// //   { chunkName: 'merchant-board', retries: 3 }
// // );
// // const VendorBoard = withLazyLoading(
// //   () => import('@/pages/DashboardOverview1/VendorBoard/index'),
// //   { chunkName: 'vendor-board', retries: 3 }
// // );
// // const Miscellaneous = withLazyLoading(
// //   () => import('@/pages/DashboardOverview1/Miscellaneous/index'),
// //   { chunkName: 'miscellaneous', retries: 3 }
// // );

// type DataEntry = {
//   date: string;
//   amount: number;
//   count: number;
// };
// type NetBalance = {
//   merchant?: number;
//   vendor?: number;
// };
// type CalculationData = {
//   vendor: any[];
//   merchant: any[];
//   merchantTotalCalculations: any;
//   vendorTotalCalculations: any;
//   netBalance: NetBalance;
// };

// type FilterOption = {
//   label: string;
//   value: string;
// };
// type Filter = {
//   label: string;
//   value: string;
// };

// type ChartDataState = {
//   payinData: DataEntry[];
//   payoutData: DataEntry[];
//   settlementData: DataEntry[];
//   chargebackData: DataEntry[];
//   reverseData: DataEntry[];
//   payinCommissionData: DataEntry[];
//   payoutCommissionData: DataEntry[];
//   settlementCommissionData: DataEntry[];
//   totalMerchantCommissionData: DataEntry[];
//   totalVendorCommissionData: DataEntry[];
//   vendorPayinData: DataEntry[];
//   vendorPayoutData: DataEntry[];
//   vendorSettlementData: DataEntry[];
//   vendorSettlementCommissionData: DataEntry[];
//   vendorPayinCommissionData: DataEntry[];
//   vendorPayoutCommissionData: DataEntry[];
//   vendorChargebackData: DataEntry[];
//   vendorReverseData: DataEntry[];
// };

// function Main() {
//   const [newTransactionModal, setNewTransactionModal] = useState(false);
//   const userData = localStorage.getItem('userData');
//   const parsedData = userData ? JSON.parse(userData) : null;
//   const userRole = parsedData?.designation;
//   const [title, setTitle] = useState(() => {
//     if (!userRole) return 'Merchant';

//     if (
//       [
//         Role.MERCHANT,
//         Role.MERCHANT_ADMIN,
//         Role.SUB_MERCHANT,
//         Role.MERCHANT_OPERATIONS,
//       ].includes(userRole)
//     ) {
//       return 'Merchant';
//     }

//     if (
//       [
//         Role.VENDOR,
//         Role.SUB_VENDOR,
//         Role.VENDOR_OPERATIONS,
//         Role.VENDOR_ADMIN,
//       ].includes(userRole)
//     ) {
//       return 'Vendor';
//     }

//     return 'Merchant'; // Default for ADMIN and others
//   });

//   const [calculationData, setCalculationData] = useState<CalculationData>({
//     vendor: [],
//     merchant: [],
//     merchantTotalCalculations: {},
//     vendorTotalCalculations: {},
//     netBalance: {
//       merchant: 0,
//       vendor: 0,
//     },
//   });
//   const [merchantCodes, setMerchantCodes] = useState<FilterOption[]>([]);
//   const [vendorCodes, setVendorCodes] = useState<FilterOption[]>([]);
//   const [chartData, setChartData] = useState<ChartDataState>({
//     payinData: [],
//     payoutData: [],
//     settlementData: [],
//     chargebackData: [],
//     reverseData: [],
//     payinCommissionData: [],
//     payoutCommissionData: [],
//     settlementCommissionData: [], // Add this line
//     vendorPayinData: [],
//     vendorPayoutData: [],
//     vendorSettlementData: [],
//     vendorPayoutCommissionData: [],
//     totalMerchantCommissionData: [],
//     totalVendorCommissionData: [],
//     vendorPayinCommissionData: [],
//     vendorChargebackData: [],
//     vendorReverseData: [],
//     vendorSettlementCommissionData: [], // Add this
//   });
//   const [merchantSelectedFilter, setMerchantSelectedFilter] = useState<
//     FilterOption[]
//   >([]);
//   const date = dayjs().tz('Asia/Kolkata').format('YYYY-MM-DD');
//   const [merchantSelectedFilterDates, setMerchantSelectedFilterDates] =
//     useState<string>(`${date} - ${date}`);
//   const [vendorSelectedFilter, setVendorSelectedFilter] = useState<
//     FilterOption[]
//   >([]);
//   const [vendorSelectedFilterDates, setVendorSelectedFilterDates] =
//     useState<string>(`${date} - ${date}`);
//   const [isLoading, setIsloading] = useState(false);
//   const dispatch = useAppDispatch();
//   const activeTab = useAppSelector(getTabs);
//   useAppSelector(selectDarkMode); // Subscribe to dark mode to trigger re-render

//   useEffect(() => {
//     if ([Role.ADMIN, Role.TRANSACTIONS, Role.OPERATIONS].includes(userRole)) {
//       setTitle(activeTab === 0 ? 'Merchant' : 'Vendor');
//     }
//   }, [activeTab, userRole]);

//   const transactionModal = () => {
//     setMerchantSelectedFilter(merchantCodes);
//     setVendorSelectedFilter(vendorCodes);
//     setVendorSelectedFilterDates(`${date} - ${date}`);
//     setMerchantSelectedFilterDates(`${date} - ${date}`);
//   };
//   useEffect(() => {
//     transactionModal();
//   }, [merchantCodes, vendorCodes]);

//   const handleTabChange = (index: number) => {
//     // Only change tab if modal is not open
//     if (!newTransactionModal) {
//       dispatch(setActiveTab(index));
//     }
//     setIsloading(false);
//   };

//   const handleGetAllCalculations = useCallback(async (params = '') => {
//     try {
//       const res = await getAllCalculations(params);
//       if (!res?.data) {
//         throw new Error('No data received');
//       }

//       setCalculationData({
//         vendor: res?.data?.vendor || [],
//         merchant: res?.data?.merchant || [],
//         merchantTotalCalculations: res?.data?.merchantTotalCalculations || {},
//         vendorTotalCalculations: res?.data?.vendorTotalCalculations || {}, // Add this line
//         netBalance: res?.data.netBalance || { merchant: 0, vendor: 0 },
//       });
//       setIsloading(false);

//       // Extract merchant data
//       const merchantData = res.data?.merchant || [];
//       const merchantChartData = extractChartData(merchantData);

//       // Extract vendor data
//       const vendorData = res.data?.vendor || [];
//       const vendorChartData = extractChartData(vendorData);

//       // Update chart data state
//       setChartData({
//         payinData: merchantChartData.payinData,
//         payoutData: merchantChartData.payoutData,
//         settlementData: merchantChartData.settlementData,
//         chargebackData: merchantChartData.chargeBackData || [],
//         reverseData: merchantChartData.reversePayoutData || [],
//         payinCommissionData: merchantChartData.payinCommissionData || [],
//         payoutCommissionData: merchantChartData.payoutCommissionData || [],
//         settlementCommissionData:
//           merchantChartData.settlementCommissionData || [],
//         totalMerchantCommissionData:
//           merchantChartData.totalCommissionData || [],
//         vendorPayinData: vendorChartData.payinData,
//         vendorPayoutData: vendorChartData.payoutData,
//         vendorSettlementData: vendorChartData.settlementData,
//         vendorPayinCommissionData: vendorChartData.payinCommissionData || [],
//         vendorPayoutCommissionData: vendorChartData.payoutCommissionData || [],
//         vendorSettlementCommissionData:
//           vendorChartData.settlementCommissionData || [],
//         totalVendorCommissionData: vendorChartData.totalCommissionData || [],
//         vendorChargebackData: vendorChartData.chargeBackData || [],
//         vendorReverseData: vendorChartData.reversePayoutData || [],
//       });
//     } catch {
//       // Set empty data on error
//       setCalculationData({
//         vendor: [],
//         merchant: [],
//         merchantTotalCalculations: {},
//         vendorTotalCalculations: {},
//         netBalance: { merchant: 0, vendor: 0 },
//       });
//       setChartData({
//         payinData: [],
//         payoutData: [],
//         settlementData: [],
//         chargebackData: [],
//         reverseData: [],
//         payinCommissionData: [],
//         payoutCommissionData: [],
//         settlementCommissionData: [],
//         vendorPayinData: [],
//         vendorPayoutData: [],
//         vendorSettlementData: [],
//         totalMerchantCommissionData: [],
//         totalVendorCommissionData: [],
//         vendorPayinCommissionData: [],
//         vendorPayoutCommissionData: [],
//         vendorChargebackData: [],
//         vendorReverseData: [],
//         vendorSettlementCommissionData: [],
//       });
//     }
//   }, []);

//   useEffect(() => {
//     handleGetAllCalculations();
//   }, [handleGetAllCalculations]);

//   const handleGetAllMerchantCodes = useCallback(async () => {
//     if (
//       userRole !== Role.MERCHANT &&
//       userRole !== Role.ADMIN &&
//       userRole !== Role.MERCHANT_OPERATIONS &&
//       userRole !== Role.TRANSACTIONS &&
//       userRole !== Role.OPERATIONS &&
//       userRole !== Role.SUB_MERCHANT
//     ) {
//       return;
//     }
//     let res;
//     if ([Role.ADMIN, Role.TRANSACTIONS, Role.OPERATIONS].includes(userRole)) {
//       res = await getAllMerchantCodes(false, true);
//     } else {
//       res = await getAllMerchantCodes();
//     }
//     setMerchantCodes(
//       res.map((el: any) => ({
//         label: el.label,
//         value: el.value,
//       })),
//     );
//   }, []);

//   useEffect(() => {
//     handleGetAllMerchantCodes();
//   }, [handleGetAllMerchantCodes]);

//   const handleGetAllVendorCodes = useCallback(async () => {
//     if (
//       userRole !== Role.VENDOR &&
//       userRole !== Role.ADMIN &&
//       userRole !== Role.VENDOR_OPERATIONS &&
//       userRole !== Role.TRANSACTIONS &&
//       userRole !== Role.OPERATIONS &&
//       userRole !== Role.SUB_VENDOR &&
//       userRole !== Role.VENDOR_ADMIN
//     ) {
//       return;
//     }
//     let res;
//     if ([Role.ADMIN, Role.TRANSACTIONS, Role.OPERATIONS].includes(userRole)) {
//       res = await getAllVendorCodes(true, true, false, false, true, true);
//     } else {
//       res = await getAllVendorCodes(true,true,false,false,true);
//     }
//     const vendorCodesList = res.map((el: any) => ({
//       label: el.label,
//       value: el.value,
//     }));
//     setVendorCodes(vendorCodesList);
//     dispatch(getVendorCodes(vendorCodesList));
//   }, []);

//   useEffect(() => {
//     handleGetAllVendorCodes();
//   }, [handleGetAllVendorCodes]);

//   // Reset dates to current date when modal opens
//   useEffect(() => {
//     if (newTransactionModal) {
//       const formattedDate = getFormattedCurrentDate();
//       if (title === 'Merchant') {
//         setMerchantSelectedFilterDates(formattedDate);
//       } else {
//         setVendorSelectedFilterDates(formattedDate);
//       }
//     }
//   }, [newTransactionModal, title]);

//   //filter data for both vendor and merchant
//   const handleFilterData = async () => {
//     setIsloading(true);
//     const queryParams = new URLSearchParams();
//     const filterValues = [
//       Role.ADMIN,
//       Role.TRANSACTIONS,
//       Role.OPERATIONS,
//     ].includes(userRole)
//       ? activeTab === 0
//         ? merchantSelectedFilter.map((filter: Filter) => filter.value).join(',')
//         : vendorSelectedFilter.map((filter: Filter) => filter.value).join(',')
//       : [
//           Role.MERCHANT,
//           Role.MERCHANT_ADMIN,
//           Role.SUB_MERCHANT,
//           Role.MERCHANT_OPERATIONS,
//         ].includes(userRole)
//       ? merchantSelectedFilter.map((filter: Filter) => filter.value).join(',')
//       : vendorSelectedFilter.map((filter: Filter) => filter.value).join(',');

//     const selectedFilterDates = [
//       Role.ADMIN,
//       Role.TRANSACTIONS,
//       Role.OPERATIONS,
//     ].includes(userRole)
//       ? activeTab === 0
//         ? merchantSelectedFilterDates
//         : vendorSelectedFilterDates
//       : [
//           Role.MERCHANT,
//           Role.MERCHANT_ADMIN,
//           Role.SUB_MERCHANT,
//           Role.MERCHANT_OPERATIONS,
//         ].includes(userRole)
//       ? merchantSelectedFilterDates
//       : vendorSelectedFilterDates;
//     // Fix date parsing
//     if (selectedFilterDates) {
//       // Split by the whole " - " string (note the spaces)
//       const [startStr, endStr] = selectedFilterDates.split(' - ');
//       // Parse using the correct format and convert to desired format
//       const startDate = dayjs(startStr).format('YYYY-MM-DD');
//       const endDate = dayjs(endStr).format('YYYY-MM-DD');
//       queryParams.append('startDate', startDate);
//       queryParams.append('endDate', endDate);
//     }
//     if (filterValues) {
//       queryParams.append('users', filterValues);
//     }
//     handleGetAllCalculations(queryParams.toString());
//     setNewTransactionModal(false);
//   };

//   // Debounced effect for filter changes
//   useEffect(() => {
//     const debounceTimer = window.setTimeout(() => {
//       if (activeTab !== 2) {
//         handleFilterData();
//       }
//       setIsloading(false);
//     }, 1000);

//     return () => window.clearTimeout(debounceTimer);
//   }, [merchantSelectedFilter, vendorSelectedFilter, activeTab]);

  const getFilterDateRange = (dateRangeStr: string) => {
    const [startDate, endDate] = dateRangeStr.split(' - ');
    return { startDate, endDate };
  };
  const { startDate, endDate } = getFilterDateRange(
    merchantSelectedFilterDates,
  );
  const { startDate: vendorStartDate, endDate: vendorEndDate } =
    getFilterDateRange(vendorSelectedFilterDates);


  return (
    <div className="min-h-[calc(100vh-5rem)] w-full bg-slate-50 dark:bg-slate-950/95 transition-colors relative overflow-hidden">
      {/* Background wrapper to echo login aesthetics */}
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-theme-1/20 blur-3xl dark:bg-theme-1/30" />
          <div className="absolute -bottom-40 -right-6 h-72 w-72 rounded-full bg-theme-2/15 blur-3xl dark:bg-theme-2/25" />
        </div>

        <div className="relative z-10 px-3 sm:px-6 lg:px-8 pt-4 pb-8 space-y-5">
          {/* Header row with title, search and quick metrics */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                Dashboard overview
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Net balances, deposits and withdrawals at a glance for your {title.toLowerCase()} accounts.
              </p>
            </div>

            {/* Search / filter pill */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center rounded-full border border-slate-200 bg-white/90 px-3 py-2 shadow-sm text-xs sm:text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300 w-full sm:w-72">
                <Lucide icon="Search" className="w-4 h-4 mr-2 text-slate-400 dark:text-slate-500" />
                <span className="truncate">
                  {startDate === endDate
                    ? `Showing activity for ${startDate}`
                    : `Showing activity from ${startDate} to ${endDate}`}
                </span>
              </div>
            </div>
          </div>

          <DashboardStatCard />
          {/* Summary cards row */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
            
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-400 via-orange-500 to-amber-400 text-white shadow-[0_18px_60px_rgba(249,115,22,0.45)]">
              <div className="px-5 py-4 sm:px-6 sm:py-5 flex flex-col justify-between h-full">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/70">Balance</p>
                  <div className="mt-3 text-2xl sm:text-3xl font-semibold">
                    ₹
                    {((calculationData.netBalance.merchant || 0) +
                      (calculationData.netBalance.vendor || 0)
                    ).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                  <p className="mt-1 text-[0.7rem] text-white/80">
                    Updated for {title.toLowerCase()} view
                  </p>
                </div>
                <div className="mt-4 flex gap-6 text-xs text-white/90">
                  <div>
                    <p className="text-[0.7rem] uppercase tracking-[0.18em] text-white/70">
                      Merchant
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      ₹
                      {(calculationData.netBalance.merchant || 0).toLocaleString('en-IN', {
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.7rem] uppercase tracking-[0.18em] text-white/70">
                      Vendor
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      ₹
                      {(calculationData.netBalance.vendor || 0).toLocaleString('en-IN', {
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            
            <div className="rounded-3xl bg-slate-900/95 text-white shadow-[0_18px_55px_rgba(15,23,42,0.8)] border border-slate-800/80 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),_transparent_55%)] opacity-60" />
              <div className="relative px-5 py-4 sm:px-6 sm:py-5 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-400">
                      Deposits
                    </p>
                    <p className="mt-3 text-xl font-semibold">
                      ₹
                      {(calculationData.merchantTotalCalculations?.totalPayins || 0).toLocaleString(
                        'en-IN',
                        { maximumFractionDigits: 2 },
                      )}
                    </p>
                  </div>
                  <div className="flex items-center justify-center h-9 w-9 rounded-full bg-emerald-400/10 border border-emerald-300/40 text-emerald-300">
                    <Lucide icon="ArrowUpRight" className="w-4 h-4" />
                  </div>
                </div>
                <p className="mt-2 text-[0.7rem] text-slate-400">
                  Includes all successful incoming transactions in the selected period.
                </p>
              </div>
            </div>

            
            <div className="rounded-3xl bg-slate-900/95 text-white shadow-[0_18px_55px_rgba(15,23,42,0.8)] border border-slate-800/80 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(248,113,113,0.22),_transparent_55%)] opacity-60" />
              <div className="relative px-5 py-4 sm:px-6 sm:py-5 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-400">
                      Withdrawals
                    </p>
                    <p className="mt-3 text-xl font-semibold">
                      ₹
                      {(calculationData.merchantTotalCalculations?.totalPayouts || 0).toLocaleString(
                        'en-IN',
                        { maximumFractionDigits: 2 },
                      )}
                    </p>
                  </div>
                  <div className="flex items-center justify-center h-9 w-9 rounded-full bg-rose-400/10 border border-rose-300/40 text-rose-300">
                    <Lucide icon="ArrowDownRight" className="w-4 h-4" />
                  </div>
                </div>
                <p className="mt-2 text-[0.7rem] text-slate-400">
                  Outgoing settlements and payouts processed within the range.
                </p>
              </div>
            </div>
          </div> */}

          {/* Tabbed boards container */}
          <div className="mt-4">
            <div className="relative flex flex-col gap-y-5">
              <div className="flex flex-col p-3 sm:p-5 rounded-3xl bg-white/90 border border-slate-200 shadow-sm dark:bg-darkmode-800/90 dark:border-darkmode-600/80">
                <Tab.Group selectedIndex={activeTab} onChange={handleTabChange}>
                <Tab.List className="flex border-b-0 bg-transparent relative">
                  {[
                    Role.ADMIN,
                    Role.TRANSACTIONS,
                    Role.OPERATIONS,
                    Role.MERCHANT_ADMIN,
                    Role.MERCHANT,
                    Role.SUB_MERCHANT,
                    Role.MERCHANT_OPERATIONS,
                  ].includes(userRole) && (
                    <Tab className="relative flex-1">
                      {({ selected }) => (
                        <Tab.Button
                          className={`w-full py-3 px-3 sm:px-4 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-200 relative ${
                            selected
                              ? 'bg-white dark:bg-darkmode-700 text-slate-900 dark:text-white border-t-4 border-l-4 border-r-4 border-gray-100 dark:border-darkmode-400 rounded-tl-xl rounded-tr-xl shadow-sm'
                              : 'bg-slate-50 dark:bg-darkmode-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-darkmode-700'
                          }`}
                          as="button"
                          style={
                            selected
                              ? {
                                  position: 'relative',
                                  zIndex: 10,
                                }
                              : {}
                          }
                        >
                          <Lucide
                            icon="CreditCard"
                            className="w-5 h-5 sm:w-4 sm:h-4 stroke-[2] shrink-0"
                          />
                          <span className="whitespace-nowrap">
                            Merchant
                            <br className="sm:hidden" /> Board
                          </span>
                        </Tab.Button>
                      )}
                    </Tab>
                  )}
                  {[
                    Role.ADMIN,
                    Role.TRANSACTIONS,
                    Role.OPERATIONS,
                    Role.VENDOR,
                    Role.VENDOR_OPERATIONS,
                    Role.VENDOR_ADMIN,
                  ].includes(userRole) &&
                    ![
                      Role.MERCHANT,
                      Role.MERCHANT_ADMIN,
                      Role.SUB_MERCHANT,
                      Role.MERCHANT_OPERATIONS,
                    ].includes(userRole) && (
                      <Tab className="relative flex-1">
                        {({ selected }) => (
                          <Tab.Button
                            className={`w-full py-3 px-3 sm:px-4 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-200 relative ${
                              selected
                                ? 'bg-white dark:bg-darkmode-700 text-slate-900 dark:text-white border-t-4 border-l-4 border-r-4 border-gray-100 dark:border-darkmode-400 rounded-tl-xl rounded-tr-xl shadow-sm'
                                : 'bg-slate-50 dark:bg-darkmode-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-darkmode-700'
                            }`}
                            as="button"
                            style={
                              selected
                                ? {
                                    position: 'relative',
                                    zIndex: 10,
                                  }
                                : {}
                            }
                          >
                            <Lucide
                              icon="Store"
                              className="w-5 h-5 sm:w-4 sm:h-4 stroke-[2] shrink-0"
                            />
                            <span className="whitespace-nowrap">
                              Vendor
                              <br className="sm:hidden" /> Board
                            </span>
                          </Tab.Button>
                        )}
                      </Tab>
                    )}
                  {[Role.ADMIN].includes(userRole) && (
                    <Tab className="relative flex-1">
                      {({ selected }) => (
                        <Tab.Button
                          className={`w-full py-3 px-3 sm:px-4 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-200 relative ${
                            selected
                              ? 'bg-white dark:bg-darkmode-700 text-slate-900 dark:text-white border-t-4 border-l-4 border-r-4 border-gray-100 dark:border-darkmode-400 rounded-tl-xl rounded-tr-xl shadow-sm'
                              : 'bg-slate-50 dark:bg-darkmode-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-darkmode-700'
                          }`}
                          as="button"
                          style={
                            selected
                              ? {
                                  position: 'relative',
                                  zIndex: 10,
                                }
                              : {}
                          }
                        >
                          <Lucide
                            icon="LayoutGrid"
                            className="w-5 h-5 sm:w-4 sm:h-4 stroke-[2] shrink-0"
                          />
                          <span className="whitespace-nowrap text-center">
                            Miscellaneous
                            <br className="sm:hidden" /> Board
                          </span>
                        </Tab.Button>
                      )}
                    </Tab>
                  )}
                </Tab.List>
                <Tab.Panels className="border-b border-l border-r border-gray-100 dark:border-darkmode-400 border-t-4 border-t-gray-100 dark:border-t-darkmode-400">
                  {[
                    Role.ADMIN,
                    Role.TRANSACTIONS,
                    Role.OPERATIONS,
                    Role.MERCHANT_ADMIN,
                    Role.MERCHANT,
                    Role.SUB_MERCHANT,
                    Role.MERCHANT_OPERATIONS,
                  ].includes(userRole) && (
                    <Tab.Panel className="p-3 sm:p-5 leading-relaxed">
                      <MerchantBoard
                        calculationData={calculationData}
                        payinChartData={chartData.payinData}
                        payoutChartData={chartData.payoutData}
                        ChargebackChartData={chartData.chargebackData}
                        ReverseChartData={chartData.reverseData}
                        payInCommissionData={chartData.payinCommissionData}
                        payoutCommissionData={chartData.payoutCommissionData}
                        settlementChartData={chartData.settlementData}
                        settlementCommissionData={
                          chartData.settlementCommissionData
                        } // Add this line
                        totalMerchantCommissionData={
                          chartData.totalMerchantCommissionData
                        }
                        merchantSelectedFilterDates={
                          merchantSelectedFilterDates
                        }
                        setMerchantSelectedFilterDates={
                          setMerchantSelectedFilterDates
                        }
                        merchantSelectedFilter={merchantSelectedFilter}
                        setMerchantSelectedFilter={setMerchantSelectedFilter}
                        merchantCodes={merchantCodes}
                        handleFilterData={handleFilterData}
                        startDate={startDate}
                        endDate={endDate}
                        isLoading={isLoading}
                      />
                    </Tab.Panel>
                  )}
                  {[
                    Role.ADMIN,
                    Role.TRANSACTIONS,
                    Role.OPERATIONS,
                    Role.VENDOR,
                    Role.SUB_VENDOR,
                    Role.VENDOR_OPERATIONS,
                    Role.VENDOR_ADMIN,
                  ].includes(userRole) && (
                    <Tab.Panel className="p-5 leading-relaxed">
                      <VendorBoard
                        calculationData={calculationData}
                        vendorPayinChartData={chartData.vendorPayinData}
                        ChargebackChartData={chartData.vendorChargebackData}
                        ReverseChartData={chartData.vendorReverseData}
                        vendorPayoutChartData={chartData.vendorPayoutData}
                        payInCommissionData={
                          chartData.vendorPayinCommissionData
                        }
                        payoutCommissionData={
                          chartData.vendorPayoutCommissionData
                        }
                        vendorSettlementChartData={
                          chartData.vendorSettlementData
                        }
                        settlementCommissionData={
                          chartData.vendorSettlementCommissionData
                        } // Add this line
                        totalVendorCommissionData={
                          chartData.totalVendorCommissionData
                        }
                        vendorSelectedFilterDates={vendorSelectedFilterDates}
                        setVendorSelectedFilterDates={
                          setVendorSelectedFilterDates
                        }
                        vendorSelectedFilter={vendorSelectedFilter}
                        setVendorSelectedFilter={setVendorSelectedFilter}
                        vendorCodes={vendorCodes}
                        handleFilterData={handleFilterData}
                        startDate={vendorStartDate}
                        endDate={vendorEndDate}
                        isLoading={isLoading}
                      />
                    </Tab.Panel>
                  )}
                  {[Role.ADMIN].includes(userRole) && (
                    <Tab.Panel className="p-5 leading-relaxed">
                      <Miscellaneous
                        merchantCodes={merchantCodes}
                        // selectedDate={miscSelectedFilterDate}
                        // selectedMerchants={miscSelectedFilter.map(f => f.value)}
                      />
                    </Tab.Panel>
                  )}
                </Tab.Panels>
              </Tab.Group>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// export default Main;
