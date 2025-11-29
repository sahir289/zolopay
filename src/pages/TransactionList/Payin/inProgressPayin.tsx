/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import TransactionPageHeader from '@/components/transaction-list/header';
import Sumbar from '@/components/transaction-list/payins/sum-bar';
import Payins from '@/components/transaction-list/payins';

const InProgressPayIn: React.FC = () => {

  return (
    <>
      <TransactionPageHeader />
      <Sumbar />
      <Payins status='in-progress'/>
    </>
  );
};

export default InProgressPayIn;
