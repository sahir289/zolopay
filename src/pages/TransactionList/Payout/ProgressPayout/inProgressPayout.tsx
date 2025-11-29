/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import TransactionPageHeader from '@/components/transaction-list/header';
import Payouts from '@/components/transaction-list/payouts';
import React from 'react';

const InProgressPayOut: React.FC = () => {
  
  return (
    <>
      <TransactionPageHeader title='Withdrawals' />
      <Payouts status='progress'/>
    </>
  );
};

export default InProgressPayOut;
