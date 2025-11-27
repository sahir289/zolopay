

type DashboardListCardProps = {
    data: {
        type: string,
        sent: number,
        received: number
    }[],
    title: string
}

export default function DashboardListCard (props: DashboardListCardProps) {
    return (
        <>
        <div className="p-4 bg-gray-100 dark:bg-darkmode-800 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">
            {props.title}
          </h3>
          <div className="space-y-4">
            {props.data.map((item, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-darkmode-900 p-4 rounded-md shadow-sm"
              >
                <div className="text-center sm:text-left">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
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
                  <p className="text-base font-bold text-gray-800 dark:text-white">
                    Total: ₹{item.sent + item.received}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        </>
    )
}