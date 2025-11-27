/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Lucide from '@/components/Base/Lucide';
import BarChart from '@/components/VerticalBarChart';
import { useEffect, useMemo, useState } from 'react';
import MultiSelect from '@/components/MultiSelect/MultiSelect';
import Litepicker from '@/components/Base/Litepicker';
import DashboardStatCard from '@/components/dashboard-stat-card';
import DashboardFilter from '@/components/dashboard-filter';
import DashboardListCard from '@/components/dashboard-list-card';
import DashboardChart from '@/components/dashboard-chart';

function VendorBoard({
  calculationData,
  // vendorPayinChartData,
  // vendorPayoutChartData,
  // ChargebackChartData,
  // ReverseChartData,
  // totalVendorCommissionData,
  // vendorSettlementChartData,
  vendorSelectedFilterDates,
  setVendorSelectedFilterDates,
  vendorSelectedFilter,
  setVendorSelectedFilter,
  vendorCodes,
  handleFilterData,
  startDate,
  endDate,
  isLoading,
}: any) {

  const settlementsData = useMemo(() => [
    {
      type: 'Bank',
      sent: calculationData?.vendorTotalCalculations?.total_banksentsettlement_amount || 0,
      received: calculationData?.vendorTotalCalculations?.total_bankreceivedsettlement_amount || 0,
    },
    {
      type: 'Cash',
      sent: calculationData?.vendorTotalCalculations?.total_cashsentsettlement_amount || 0,
      received: calculationData?.vendorTotalCalculations?.total_cashreceivedsettlement_amount || 0,
    },
    {
      type: 'Crypto',
      sent: calculationData?.vendorTotalCalculations?.total_cryptosentsettlement_amount || 0,
      received: calculationData?.vendorTotalCalculations?.total_cryptoreceivedsettlement_amount || 0,
    },
    {
      type: 'AED',
      sent: calculationData?.vendorTotalCalculations?.total_aedsentsettlement_amount || 0,
      received: calculationData?.vendorTotalCalculations?.total_aedreceivedsettlement_amount || 0,
    },
  ], [calculationData?.vendorTotalCalculations]);

  const commissionsData = useMemo(() => [
    {
      type: 'Payin',
      sent: calculationData?.vendorTotalCalculations?.total_payin_commission || 0,
      received: calculationData?.vendorTotalCalculations?.total_payin_received_commission || 0,
    },
    {
      type: 'Payout',
      sent: calculationData?.vendorTotalCalculations?.total_payout_commission || 0,
      received: calculationData?.vendorTotalCalculations?.total_payout_received_commission || 0,
    },
    {
      type: 'Reversed',
      sent: calculationData?.vendorTotalCalculations?.total_reverse_payout_commission || 0,
      received: calculationData?.vendorTotalCalculations?.total_reverse_received_commission || 0,
    },
    {
      type: 'Settlements',
      sent: calculationData?.vendorTotalCalculations?.total_settlement_commission || 0,
      received: calculationData?.vendorTotalCalculations?.total_settlement_received_commission || 0,
    },
    {
      type: 'Adjustments',
      sent: calculationData?.vendorTotalCalculations?.total_adjustment_commission || 0,
      received: calculationData?.vendorTotalCalculations?.total_adjustment_received_commission || 0,
    },
  ], [calculationData?.vendorTotalCalculations]);

  const stats = useMemo(() => ({
      netBalance: Number(calculationData?.netBalance?.vendor?.toFixed(2) || calculationData?.vendorTotalCalculations?.net_balance?.toFixed(2) || 0),
      currentBalance: calculationData?.vendorTotalCalculations?.current_balance || 0,
      deposits: calculationData?.vendorTotalCalculations?.total_payin_amount || 0,
      withdrawals: calculationData?.vendorTotalCalculations?.total_payout_amount || 0,
      settlements: calculationData?.vendorTotalCalculations?.total_settlement_amount || 0,
      reverseWithdrawals: calculationData?.vendorTotalCalculations?.total_reverse_payout_amount || 0,
      commission: Number(
        (
          (calculationData?.vendorTotalCalculations?.total_payin_commission || 0) +
          (calculationData?.vendorTotalCalculations?.total_payout_commission || 0) +
          (calculationData?.vendorTotalCalculations?.total_reverse_payout_commission || 0)
        ).toFixed(2),
      ),
      chargebacks: calculationData?.vendorTotalCalculations?.total_chargeback_amount || 0,
      adjustments: calculationData?.vendorTotalCalculations?.total_adjustment_amount || 0,
    }), [calculationData])

  return (
    <div className="col-span-12 space-y-6">
      
      <DashboardFilter
        codes={vendorCodes}
        selectedFilter={vendorSelectedFilter}
        setSelectedFilter={setVendorSelectedFilter}
        selectPlaceholder="Select Vendor"
        selectedFilterDates={vendorSelectedFilterDates}
        setSelectedFilterDates={setVendorSelectedFilterDates}
        startDate={startDate}
        endDate={endDate}
        handleFilterData={handleFilterData}
        isLoading={isLoading}
      />

      <DashboardStatCard {...stats}/>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <DashboardListCard title='Settlements' data={settlementsData}/>
        <DashboardListCard title='Commissions' data={commissionsData}/>
      </div>

      <DashboardChart
        title='Vendor Calculations'
        deposits={vendorPayinChartData}
        withdrawals={vendorPayoutChartData}
        commission={totalVendorCommissionData}
        reversals={ReverseChartData}
        settlements={vendorSettlementChartData}
        chargebacks={ChargebackChartData}
      />
    </div>
  );
}

export default VendorBoard;
