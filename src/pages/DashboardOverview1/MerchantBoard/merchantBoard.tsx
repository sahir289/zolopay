import { useMemo } from 'react';
import DashboardStatCard from '@/components/dashboard-stat-card';
import DashboardFilter from '@/components/dashboard-filter';
import DashboardListCard from '@/components/dashboard-list-card';
import DashboardChart from '@/components/dashboard-chart';

function MerchantBoard({
  calculationData,
  payinChartData,
  payoutChartData,
  ChargebackChartData,
  ReverseChartData,
  totalMerchantCommissionData,
  settlementChartData,
  merchantSelectedFilterDates,
  setMerchantSelectedFilterDates,
  merchantSelectedFilter,
  setMerchantSelectedFilter,
  merchantCodes,
  handleFilterData,
  startDate,
  endDate,
  isLoading,
}: any) {

  const settlementsData = useMemo(() => [
    {
      type: 'Bank',
      sent: calculationData?.merchantTotalCalculations?.total_banksentsettlement_amount || 0,
      received: calculationData?.merchantTotalCalculations?.total_bankreceivedsettlement_amount || 0,
    },
    {
      type: 'Cash',
      sent: calculationData?.merchantTotalCalculations?.total_cashsentsettlement_amount || 0,
      received: calculationData?.merchantTotalCalculations?.total_cashreceivedsettlement_amount || 0,
    },
    {
      type: 'Crypto',
      sent: calculationData?.merchantTotalCalculations?.total_cryptosentsettlement_amount || 0,
      received: calculationData?.merchantTotalCalculations?.total_cryptoreceivedsettlement_amount || 0,
    },
    {
      type: 'AED',
      sent: calculationData?.merchantTotalCalculations?.total_aedsentsettlement_amount || 0,
      received: calculationData?.merchantTotalCalculations?.total_aedreceivedsettlement_amount || 0,
    },
  ], [calculationData?.merchantTotalCalculations]);

  const commissionsData = useMemo(() => [
    {
      type: 'Deposits',
      sent: calculationData?.merchantTotalCalculations?.total_payin_commission || 0,
      received: calculationData?.merchantTotalCalculations?.total_payin_received_commission || 0,
    },
    {
      type: 'Withdrawals',
      sent: calculationData?.merchantTotalCalculations?.total_payout_commission || 0,
      received: calculationData?.merchantTotalCalculations?.total_payout_received_commission || 0,
    },
    {
      type: 'Reversed Payments',
      sent: calculationData?.merchantTotalCalculations?.total_reverse_payout_commission || 0,
      received: calculationData?.merchantTotalCalculations?.total_reverse_received_commission || 0,
    },
    {
      type: 'Reconciliations',
      sent: calculationData?.merchantTotalCalculations?.total_settlement_commission || 0,
      received: calculationData?.merchantTotalCalculations?.total_settlement_received_commission || 0,
    },
    {
      type: 'Balance Adjustments',
      sent: calculationData?.merchantTotalCalculations?.total_adjustment_commission || 0,
      received: calculationData?.merchantTotalCalculations?.total_adjustment_received_commission || 0,
    },
  ], [calculationData?.merchantTotalCalculations]);

  const stats = useMemo(() => ({
    netBalance: Number(calculationData?.netBalance?.merchant?.toFixed(2) || calculationData?.merchantTotalCalculations?.net_balance?.toFixed(2) || 0),
    currentBalance: calculationData?.merchantTotalCalculations?.current_balance || 0,
    deposits: calculationData?.merchantTotalCalculations?.total_payin_amount || 0,
    withdrawals: calculationData?.merchantTotalCalculations?.total_payout_amount || 0,
    settlements: calculationData?.merchantTotalCalculations?.total_settlement_amount || 0,
    reverseWithdrawals: calculationData?.merchantTotalCalculations?.total_reverse_payout_amount || 0,
    commission: Number(
      (
        (calculationData?.merchantTotalCalculations?.total_payin_commission || 0) +
        (calculationData?.merchantTotalCalculations?.total_payout_commission || 0) +
        (calculationData?.merchantTotalCalculations?.total_reverse_payout_commission || 0)
      ).toFixed(2),
    ),
    chargebacks: calculationData?.merchantTotalCalculations?.total_chargeback_amount || 0,
    adjustments: calculationData?.merchantTotalCalculations?.total_adjustment_amount || 0,
  }), [calculationData])

  return (
    <div className="col-span-12 space-y-6">
      {/* Filters */}
      <DashboardFilter
        codes={merchantCodes}
        selectedFilter={merchantSelectedFilter}
        setSelectedFilter={setMerchantSelectedFilter}
        selectPlaceholder="Select Merchant"
        selectedFilterDates={merchantSelectedFilterDates}
        setSelectedFilterDates={setMerchantSelectedFilterDates}
        startDate={startDate}
        endDate={endDate}
        handleFilterData={handleFilterData}
        isLoading={isLoading}
      />

      <DashboardStatCard {...stats}/>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <DashboardListCard title='Reconciliations' data={settlementsData}/>
        <DashboardListCard title='Commissions' data={commissionsData}/>
      </div>

      <DashboardChart
        title='Payment Partner Metrics'
        deposits={payinChartData}
        withdrawals={payoutChartData}
        commission={totalMerchantCommissionData}
        reversals={ReverseChartData}
        settlements={settlementChartData}
        chargebacks={ChargebackChartData}
      />
    </div>
  );
}

export default MerchantBoard;
