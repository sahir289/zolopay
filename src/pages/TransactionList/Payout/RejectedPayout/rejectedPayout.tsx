/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import TransactionPageHeader from '@/components/transaction-list/header';
import Payouts from '@/components/transaction-list/payouts';
import React from 'react';

const RejectedPayOut: React.FC = () => {

  return (
    <>
      <TransactionPageHeader title='PayOuts'/>
      <Payouts status='rejected'/>
    </>
  );
};

export default RejectedPayOut;
