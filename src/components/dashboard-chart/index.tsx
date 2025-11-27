import VerticalBarChart from '@/components/VerticalBarChart';

type DashboardChartProps = {
    title: string,
    deposits: any,
    withdrawals: any,
    commission: any,
    reversals: any,
    settlements: any,
    chargebacks: any
}

export default function DashboardChart (props: DashboardChartProps) {
    return (
        <div className="w-full p-4 bg-white dark:bg-darkmode-700 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">
                {props.title}
            </h3>
            <VerticalBarChart
                height={400}
                className="relative z-10 w-full"
                datasets={[
                    {
                    data: props.deposits || [],
                    label: 'Deposits Amount',
                    color: '0, 0, 255', // blue
                    },
                    {
                    data: props.withdrawals || [],
                    label: 'Withdrawals Amount',
                    color: '255, 165, 0', // orange
                    },
                    {
                    data: props.commission || [],
                    label: 'Commissions Amount',
                    color: '128, 0, 128', // purple
                    },
                    {
                    data: props.reversals || [],
                    label: 'Reverse Withdrawals Amount',
                    color: '255, 206, 86', // yellow
                    },
                    {
                    data: props.settlements || [],
                    label: 'Settlements Amount',
                    color: '153, 102, 255', // purple
                    },
                    {
                    data: props.chargebacks || [],
                    label: 'Chargebacks Amount',
                    color: '255, 99, 132', // red
                    },
                ]}
            />
        </div>
    )
}