/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Lucide from '@/components/Base/Lucide';
import BarChart from '@/components/VerticalBarChart';
import { useEffect, useState } from 'react';
import MultiSelect from '@/components/MultiSelect/MultiSelect';
import Litepicker from '@/components/Base/Litepicker';

function VendorBoard({
  calculationData,
  vendorPayinChartData,
  vendorPayoutChartData,
  ChargebackChartData,
  ReverseChartData,
  totalVendorCommissionData,
  vendorSettlementChartData,
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
  const [totalCalculations, setTotalCalculations] = useState(
    calculationData?.vendorTotalCalculations || {},
  );

  useEffect(() => {
    if (calculationData?.vendorTotalCalculations) {
      setTotalCalculations(calculationData.vendorTotalCalculations);
    }
  }, [calculationData]);

  const totalCommission = Number(
    (
      (totalCalculations?.total_payin_commission || 0) +
      (totalCalculations?.total_payout_commission || 0) +
      (totalCalculations?.total_reverse_payout_commission || 0)
    ).toFixed(2),
  );

  const calculationItems = [
    {
      title: 'Deposits',
      value: totalCalculations?.total_payin_amount || 0,
      icon: 'BadgeIndianRupee',
      color: 'bg-blue-100 text-blue-700',
    },
    {
      title: 'Withdrawals',
      value: totalCalculations?.total_payout_amount || 0,
      icon: 'ArrowRightCircle',
      color: 'bg-green-100 text-green-700',
    },
    {
      title: 'Reverse Withdrawals',
      value: totalCalculations?.total_reverse_payout_amount || 0,
      icon: 'ArrowLeftCircle',
      color: 'bg-yellow-100 text-yellow-700',
    },
    {
      title: 'Commission',
      value: totalCommission,
      icon: 'BadgePercent',
      color: 'bg-purple-100 text-purple-700',
    },
    {
      title: 'Settlements',
      value: totalCalculations?.total_settlement_amount || 0,
      icon: 'NotebookText',
      color: 'bg-indigo-100 text-indigo-700',
    },
    {
      title: 'ChargeBacks',
      value: totalCalculations?.total_chargeback_amount || 0,
      icon: 'ArrowLeftCircle',
      color: 'bg-red-100 text-red-700',
    },
    {
      title: 'Adjustments',
      value: totalCalculations?.total_adjustment_amount || 0,
      icon: 'Adjustments',
      color: 'bg-teal-100 text-teal-700',
    },
  ];

  const currentBalance = totalCalculations?.current_balance || 0;
  const netBalance =
    calculationData?.netBalance?.vendor?.toFixed(2) ||
    totalCalculations?.net_balance?.toFixed(2) ||
    0;

  const settlementsData = [
    {
      type: 'Bank',
      sent: totalCalculations?.total_banksentsettlement_amount || 0,
      received: totalCalculations?.total_bankreceivedsettlement_amount || 0,
    },
    {
      type: 'Cash',
      sent: totalCalculations?.total_cashsentsettlement_amount || 0,
      received: totalCalculations?.total_cashreceivedsettlement_amount || 0,
    },
    {
      type: 'Crypto',
      sent: totalCalculations?.total_cryptosentsettlement_amount || 0,
      received: totalCalculations?.total_cryptoreceivedsettlement_amount || 0,
    },
    {
      type: 'AED',
      sent: totalCalculations?.total_aedsentsettlement_amount || 0,
      received: totalCalculations?.total_aedreceivedsettlement_amount || 0,
    },
  ];

  const commissionsData = [
    {
      type: 'Payin',
      sent: totalCalculations?.total_payin_commission || 0,
      received: totalCalculations?.total_payin_received_commission || 0,
    },
    {
      type: 'Payout',
      sent: totalCalculations?.total_payout_commission || 0,
      received: totalCalculations?.total_payout_received_commission || 0,
    },
    {
      type: 'Reversed',
      sent: totalCalculations?.total_reverse_payout_commission || 0,
      received: totalCalculations?.total_reverse_received_commission || 0,
    },
    {
      type: 'Settlements',
      sent: totalCalculations?.total_settlement_commission || 0,
      received: totalCalculations?.total_settlement_received_commission || 0,
    },
    {
      type: 'Adjustments',
      sent: totalCalculations?.total_adjustment_commission || 0,
      received: totalCalculations?.total_adjustment_received_commission || 0,
    },
  ];

  const calculationChartDatasets = [
    {
      data: vendorPayinChartData || [],
      label: 'Deposits Amount',
      color: '0, 0, 255', // blue
    },
    {
      data: vendorPayoutChartData || [],
      label: 'Withdrawals Amount',
      color: '255, 165, 0', // orange
    },
    {
      data: totalVendorCommissionData || [],
      label: 'Commissions Amount',
      color: '128, 0, 128', // purple
    },
    {
      data: ReverseChartData || [],
      label: 'Reverse Withdrawals Amount',
      color: '255, 206, 86', // yellow
    },
    {
      data: vendorSettlementChartData || [],
      label: 'Settlements Amount',
      color: '153, 102, 255', // purple
    },
    {
      data: ChargebackChartData || [],
      label: 'Chargebacks Amount',
      color: '255, 99, 132', // red
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-y-6 gap-x-4 lg:gap-y-10 lg:gap-x-6">
      <div className="col-span-12">
        {/* Filters */}
        <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
          <div className="col-span-12 sm:col-span-6 mx-0 sm:mx-2 mt-2">
            <MultiSelect
              codes={vendorCodes}
              selectedFilter={vendorSelectedFilter}
              setSelectedFilter={setVendorSelectedFilter}
              placeholder="Select Vendor"
            />
          </div>
          <div className="w-full md:w-1/2">
            <Litepicker
              value={vendorSelectedFilterDates}
              onChange={(e) => setVendorSelectedFilterDates(e.target.value)}
              enforceRange={false}
              options={{
                autoApply: true,
                singleMode: false,
                numberOfColumns: 2,
                numberOfMonths: 2,
                showWeekNumbers: true,
                dropdowns: {
                  minYear: 1990,
                  maxYear: null,
                  months: true,
                  years: true,
                },
                startDate: startDate,
                endDate: endDate,
              }}
              placeholder="Select a date range"
              className="w-full pl-9 rounded-md"
            />
          </div>
          <button
            onClick={handleFilterData}
            disabled={isLoading}
            className="w-full md:w-auto px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600"
          >
            {isLoading ? 'Loading...' : 'Search'}
          </button>
        </div>

        {/* Calculations Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {calculationItems.map((item, index) => (
            <div
              key={index}
              className={`flex flex-col items-center p-4 rounded-lg shadow-md ${item.color}`}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/50 mb-4">
                {/* <Lucide icon={item.icon} className="w-6 h-6" /> */}
              </div>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-xl font-bold">₹{item.value}</p>
            </div>
          ))}
        </div>

        {/* Current Balance and Net Balance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col items-center justify-center p-6 bg-green-100 text-green-700 rounded-lg shadow-md">
            <Lucide icon="DollarSign" className="w-10 h-10 mb-4" />
            <h3 className="text-lg font-semibold">Current Balance</h3>
            <p className="text-2xl font-bold">₹{currentBalance}</p>
          </div>
          <div className="flex flex-col items-center justify-center p-6 bg-blue-100 text-blue-700 rounded-lg shadow-md">
            <Lucide icon="TrendingUp" className="w-10 h-10 mb-4" />
            <h3 className="text-lg font-semibold">Net Balance</h3>
            <p className="text-2xl font-bold">₹{netBalance}</p>
          </div>
        </div>

        {/* Settlements & Commissions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 bg-gray-100 dark:bg-darkmode-800 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">
              Settlements
            </h3>
            <div className="space-y-4">
              {settlementsData.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-darkmode-900 p-4 rounded-md shadow-sm"
                >
                  <div className="text-center sm:text-left">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {item.type}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Sent: ₹{item.sent}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Received: ₹{item.received}
                    </p>
                  </div>
                  <div className="text-center sm:text-right mt-2 sm:mt-0">
                    <p className="text-sm font-bold text-gray-800 dark:text-white">
                      Total: ₹{item.sent + item.received}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-gray-100 dark:bg-darkmode-800 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">
              Commissions
            </h3>
            <div className="space-y-4">
              {commissionsData.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-darkmode-900 p-4 rounded-md shadow-sm"
                >
                  <div className="text-center sm:text-left">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {item.type}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Sent: ₹{item.sent}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Received: ₹{item.received}
                    </p>
                  </div>
                  <div className="text-center sm:text-right mt-2 sm:mt-0">
                    <p className="text-sm font-bold text-gray-800 dark:text-white">
                      Total: ₹{item.sent + item.received}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calculation Chart */}
        <div className="w-full p-4 bg-white dark:bg-darkmode-700 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">
            Calculations
          </h3>
          <BarChart
            height={400}
            className="relative z-10 w-full"
            datasets={calculationChartDatasets}
          />
        </div>
      </div>
    </div>
  );
}

export default VendorBoard;
