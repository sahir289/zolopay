import Litepicker from "../Base/Litepicker"
import MultiSelect from "../MultiSelect/MultiSelect"

type DashboardFilterProps = {
    codes: any,
    selectedFilter: any,
    setSelectedFilter: any,
    selectPlaceholder: string,
    selectedFilterDates: any,
    setSelectedFilterDates: any,
    startDate: any,
    endDate: any,
    handleFilterData: any,
    isLoading: boolean
}

export default function DashboardFilter (props: DashboardFilterProps) {
    return (
        <>
        <div className="space-y-3">
            <div className="w-full border border-gray-200 dark:border-dark-600 rounded-md">
                <MultiSelect
                    codes={props.codes}
                    selectedFilter={props.selectedFilter}
                    setSelectedFilter={props.setSelectedFilter}
                    placeholder={props.selectPlaceholder}
                />
            </div>
            <div className="w-full flex gap-5">
                <Litepicker
                    value={props.selectedFilterDates}
                    onChange={(e) => props.setSelectedFilterDates(e.target.value)}
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
                        startDate: props.startDate,
                        endDate: props.endDate,
                    }}
                    placeholder="Select a date range"
                    className="w-full pl-9 rounded-md"
                />
                <button
                    onClick={props.handleFilterData}
                    disabled={props.isLoading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600"
                >
                    {props.isLoading ? 'Loading...' : 'Search'}
                </button>
            </div>
        </div>
        </>
    )
}