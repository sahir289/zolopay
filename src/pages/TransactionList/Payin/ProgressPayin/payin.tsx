/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useEffect, useState } from 'react';
import { Tab } from '@/components/Base/Headless';
import { Role } from '@/constants';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { selectDarkMode } from '@/redux-toolkit/slices/common/darkMode/darkModeSlice';
import { setActiveTab } from '@/redux-toolkit/slices/common/tabs/tabSlice';
import { getTabs } from '@/redux-toolkit/slices/common/tabs/tabSelectors';
import { onload } from '@/redux-toolkit/slices/payin/payinSlice';
import InProgressPayIn from '@/pages/TransactionList/Payin/ProgressPayin/inProgressPayin';
import { getAllVendorCodes } from '@/redux-toolkit/slices/vendor/vendorAPI';
import { getAllMerchantCodes } from '@/redux-toolkit/slices/merchants/merchantAPI';
import { getAllBankNames } from '@/redux-toolkit/slices/bankDetails/bankDetailsAPI';
import { getBankNames } from '@/redux-toolkit/slices/bankDetails/bankDetailsSlice';
import { selectAllBankNames } from '@/redux-toolkit/slices/bankDetails/bankDetailsSelectors';

const PayInComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  useAppSelector(selectDarkMode); // Subscribe to dark mode to trigger re-render
  const activeTab = useAppSelector(getTabs);
  // const getSumPayin = useAppSelector(getSumPayIn);
  
  const [vendorCodes, setVendorCodes] = useState<any[]>([]);
  const [merchantCodes, setMerchantCodes] = useState<any[]>([]);
  const [merchantCodesData, setMerchantCodesData] = useState<any[]>([]);

  const [callMerchant, setCallMerchant] = useState<boolean>(false);
  const [callVendor, setCallVendor] = useState<boolean>(false);
  const [callBank, setCallBank] = useState<boolean>(false);

  const handleTabChange = (index: number) => {
    // Don't do anything if clicking the same tab
    if (index === activeTab) return;
    
    dispatch(setActiveTab(index));
    dispatch(onload());
  };
  const Data = localStorage.getItem('userData');
  type RoleType = keyof typeof Role;
  let role: RoleType | null = null;

  if (Data !== null) {
    const parsedData = JSON.parse(Data) as { role: RoleType };
    role = parsedData.role;
  }

  const bankNames = useAppSelector(selectAllBankNames);
  const fetchBankNames = async () => {
    let bankNamesList;
    if (bankNames.length == 0) {
       bankNamesList = await getAllBankNames('PayIn');
    }
    if (bankNamesList) {
      dispatch(getBankNames(bankNamesList.bankNames));
    }
  };

  const handleGetAllVendorCodes = async () => {
      if (
        role !== Role.MERCHANT && vendorCodes.length == 0
      ) {
        const res = await getAllVendorCodes();
        setVendorCodes(
          res.map((el: any) => ({
            label: el.label,
            value: el.value,
          })),
        );
      }
    };
  
    useEffect(() => {
      if (role !== Role.MERCHANT && callVendor)  {
        handleGetAllVendorCodes();
        setCallVendor(false);
      }
    }, [callVendor]);
    useEffect(() => {
      if (role !== Role.MERCHANT && callBank) {
        fetchBankNames();
        setCallBank(false);
      }
    }, [callBank]);
  const handleGetAllMerchantCodes = async () => {
      if (
        role !== Role.VENDOR && merchantCodes.length == 0
      ) {
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
    };
    useEffect(() => {
      if (role !== Role.VENDOR && callMerchant) {
        handleGetAllMerchantCodes();
        setCallMerchant(false);
      }
    }, [callMerchant]);

  return (
    <div className="flex flex-col">
            <div>
      <h2 className="font-semibold text-lg mr-auto text-gray-800 dark:text-white pb-2">Progress Deposits</h2>
      </div>
      <Tab.Group selectedIndex={activeTab} onChange={handleTabChange}>
        <Tab.Panels className="border-b border-l border-r border-gray-100 dark:border-darkmode-400 border-t-4 border-t-gray-100 dark:border-t-darkmode-400">
          <Tab.Panel className="p-2 sm:p-4 md:p-5 leading-relaxed">
            <InProgressPayIn
              vendorCodes={vendorCodes}
              merchantCodes={merchantCodes}
              merchantCodesData={merchantCodesData}
              bankNames={bankNames}
              setCallMerchant={setCallMerchant}
              setCallVendor={setCallVendor}
              setCallBank={setCallBank}
            />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default PayInComponent;
