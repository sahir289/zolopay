/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import React from 'react';
import { Tab } from '@/components/Base/Headless';
import { Role } from '@/constants';
// import { withLazyLoading } from '@/utils/lazyStrategies';
import { useState  ,useEffect } from 'react';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { selectDarkMode } from '@/redux-toolkit/slices/common/darkMode/darkModeSlice';
import { setActiveTab } from '@/redux-toolkit/slices/common/tabs/tabSlice';
import { getTabs } from '@/redux-toolkit/slices/common/tabs/tabSelectors';
import { onload } from '@/redux-toolkit/slices/payout/payoutSlice';
import { getVendorCodes } from '@/redux-toolkit/slices/vendor/vendorSlice';
import { getAllVendorCodes } from '@/redux-toolkit/slices/vendor/vendorAPI';
import { getAllMerchantCodes } from '@/redux-toolkit/slices/merchants/merchantAPI';

// Normal imports instead of lazy loading
import AllPayOut from '@/pages/TransactionList/Payout/AllPayout/allPayout';

const PayOut: React.FC = () => {
  const dispatch = useAppDispatch();
  useAppSelector(selectDarkMode); // Subscribe to dark mode to trigger re-render
  const activeTab = useAppSelector(getTabs); // Get active tab from state
  const [merchantCodes, setMerchantCodes] = useState<any[]>([]);
  const [merchantCodesData, setMerchantCodesData] = useState<any[]>([]);
  const [vendorCodes, setVendorCodes] = useState<any[]>([]);
  const [vendorCodesData, setVendorCodesData] = useState<any[]>([]);
  const [callMerchant, setCallMerchant] = useState<boolean>(false);
  const [callVendor, setCallVendor] = useState<boolean>(false);
  const handleTabChange = (index: number) => {
    // Don't do anything if clicking the same tab
    if (index === activeTab) return;

    dispatch(setActiveTab(index)); // Dispatch action to set the active tab
    dispatch(onload());
  };
  const data = localStorage.getItem('userData');
  type RoleType = keyof typeof Role;
  let role: RoleType | null = null;
  if (data) {
    const parsedData = JSON.parse(data);
    role = parsedData.role;
  }

  const handleGetAllMerchantCodes = async () => {
    if (callMerchant && merchantCodes.length == 0) {
      const res = await getAllMerchantCodes();
      setMerchantCodes(
        res.map((el: any) => ({
          label: el.label,
          value: el.value,
        })),
      );
      setMerchantCodesData(
        res.map((el: any) => ({
          label: el.label,
          value: el.merchant_id,
        })),
      );
   }
  }


  const handleGetAllVendorCodes =async () => {
    if (callVendor && vendorCodes.length == 0) {
      const res = await getAllVendorCodes();
      setVendorCodes(
        res.map((el: any) => ({
          label: el.label,
          value: el.value,
        })),
      );
      setVendorCodesData(
        res.map((el: any) => ({
          label: el.label,
          value: el.vendor_id,
        })),
      );
      dispatch(getVendorCodes(res));
   }
  }

  useEffect(() => {
    if (role) {
      if (role !== Role.VENDOR) {
        handleGetAllMerchantCodes();
      }
      if (role !== Role.MERCHANT) {
        handleGetAllVendorCodes();
      }
    }
  }, [callMerchant,callVendor]);
  return (
    <div className="flex flex-col p-3 sm:p-5">
      {/* <div>
      <h2 className="font-semibold text-lg mr-auto text-gray-800 dark:text-white pb-2">All Withdrawals</h2>
      </div> */}
      <Tab.Group selectedIndex={activeTab} onChange={handleTabChange}>
        <Tab.Panels className="border-b border-l border-r border-gray-100 dark:border-darkmode-400 border-t-4 border-t-gray-100 dark:border-t-darkmode-400">
          {/* <Tab.Panel className="py-3 sm:py-5 leading-relaxed"> */}
            <AllPayOut
              vendorCodes={vendorCodes}
              merchantCodes={merchantCodes}
              merchantCodesData={merchantCodesData}
              vendorCodesData={vendorCodesData}
              setCallMerchant={setCallMerchant}
              setCallVendor={setCallVendor}
            />
          {/* </Tab.Panel> */}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default PayOut;
