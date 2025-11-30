import LoadingIcon from "@/components/Base/LoadingIcon";
import { Role, Status } from "@/constants";
import { asINR } from "@/lib/utils";
import CustomTooltip from "@/pages/Tooltip/tooltip";
import { useAppDispatch } from "@/redux-toolkit/hooks/useAppDispatch";
import { useAppSelector } from "@/redux-toolkit/hooks/useAppSelector";
import { selectDarkMode } from "@/redux-toolkit/slices/common/darkMode/darkModeSlice";
import { getAllPayInsSum } from "@/redux-toolkit/slices/payin/payinAPI";
import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface PayInSummary {
  status: string;
  totalAmount: number;
  totalCount: number;
}

interface ConsolidatedStatus {
  name: string;
  totalAmount: number;
  totalCount: number;
  statuses: PayInSummary[];
}

export default function Sumbar () {
    const dispatch = useAppDispatch();
    useAppSelector(selectDarkMode); // Subscribe to dark mode to trigger re-render
    const [data, setData] = useState<PayInSummary[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoadingSum, setIsLoadingSum] = useState(false);

    const Data = localStorage.getItem('userData');
    type RoleType = keyof typeof Role;
    let role: RoleType | null = null;

    if (Data !== null) {
        const parsedData = JSON.parse(Data) as { role: RoleType };
        role = parsedData.role;
    }
    const getSum = useCallback(async () => {
        try {
            setIsLoadingSum(true); // Set loading true before API call
            const response = await getAllPayInsSum();
            setData(response.results);
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            setError('Failed to fetch pay-in data');
        } finally {
            setIsLoadingSum(false); // Set loading false after API call completes
        }
    }, [dispatch]);

    useEffect(() => {
        if (role == Role.ADMIN) {
            getSum();
        }
    }, [getSum, dispatch]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Success':
                return 'text-green-600';
            case 'Dropped':
                return 'text-red-600';
            case 'Pending':
                return 'text-yellow-600';
            case 'InProcess':
                return 'text-blue-600';
            default:
                return 'text-gray-600';
        }
    };
    const statusMapping: { [key: string]: string } = {
        [Status.PENDING]: 'Pending',
        [Status.IMAGE_PENDING]: 'Pending',
        [Status.DISPUTE]: 'Pending',
        [Status.BANK_MISMATCH]: 'Pending',
        [Status.DUPLICATE]: 'Pending',
        [Status.INITIATED]: 'InProcess',
        [Status.ASSIGNED]: 'InProcess',
        [Status.SUCCESS]: 'Success',
        [Status.FAILED]: 'Dropped',
        [Status.DROPPED]: 'Dropped',
    };

    const consolidatedData = useMemo(() => {
        const consolidatedData: ConsolidatedStatus[] = [
            { name: 'InProcess', totalAmount: 0, totalCount: 0, statuses: [] },
            { name: 'Pending', totalAmount: 0, totalCount: 0, statuses: [] },
            { name: 'Success', totalAmount: 0, totalCount: 0, statuses: [] },
            { name: 'Dropped', totalAmount: 0, totalCount: 0, statuses: [] },
        ];
        data.forEach((item) => {
        const consolidatedName = statusMapping[item.status] || 'Pending';
        const consolidated = consolidatedData.find(
            (c) => c.name === consolidatedName,
        );
        if (consolidated) {
            consolidated.totalAmount += item.totalAmount;
            consolidated.totalCount += item.totalCount;
            consolidated.statuses.push(item);
        }
        });
        return consolidatedData;
    }, [data])

    return (
        <>
        <div className="flex flex-col p-1 sm:p-2">
          {/* Add Refresh button for getSum */}
          {error ? (
            <div className="text-red-600 text-xs sm:text-sm">Error loading data</div>
          ) : data.length === 0 ? (
            <div></div>
          ) : (
            <div className="flex flex-row flex-wrap sm:flex-nowrap gap-1 sm:gap-2">
              {consolidatedData.map((item, index) => (
                <div
                  key={index}
                  className="w-[calc(50%-0.25rem)] sm:w-1/4 p-1.5 sm:p-2 border border-dashed rounded-md border-slate-300/80 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 justify-around">
                    <div className="text-[10px] sm:text-xs font-medium">{item.totalCount}</div>
                    <div
                      className={`text-[10px] sm:text-xs font-medium truncate ${getStatusColor(
                        item.name,
                      )}`}
                    >
                      {item.name}
                    </div>
                    <CustomTooltip
                      content={
                        <div className="mt-1 text-xs sm:text-sm text-slate-300 min-w-[200px] max-w-[300px]">
                          {item.statuses.length > 0 ? (
                            item.statuses.map((status) => (
                              <div key={status.status} className="py-1">
                                {status.status}: 
                                {asINR(status.totalAmount)} (
                                {status.totalCount})
                              </div>
                            ))
                          ) : (
                            <div>No data available</div>
                          )}
                        </div>
                      }
                    >
                      <div className="text-[10px] sm:text-xs font-medium cursor-pointer truncate max-w-full">
                        {asINR(item.totalAmount)}
                      </div>
                    </CustomTooltip>
                  </div>
                </div>
              ))}
              <div className="flex justify-end w-full sm:w-auto mt-1 sm:mt-0 sm:mb-2">
                <button
                  className="px-2 sm:px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary dark:bg-primary/20 dark:hover:bg-primary/30 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={getSum}
                  disabled={isLoadingSum}
                  type="button"
                >
                  {isLoadingSum ? (
                    <LoadingIcon icon="tail-spin" className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
        </>
    )
}