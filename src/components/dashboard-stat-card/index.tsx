import { asINR, cn } from "@/lib/utils";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import StatCard from "./stat-card";
import { ArrowDownCircle, ArrowUpCircle, IndianRupee, Percent, Receipt, RotateCcw, AlertTriangle } from "lucide-react";
import SubCard from "./sub-card";

type DashboardStatCardProps = {
    netBalance: number,
    currentBalance: number,
    deposits: number,
    withdrawals: number,
    settlements: number,
    reverseWithdrawals: number,
    commission: number,
    chargebacks: number,
    adjustments: number
}

export default function DashboardStatCard (props: DashboardStatCardProps) {
    return (
        <>
        <div className={cn(
            "rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 py-5 sm:py-6 flex gap-6"
        )}>
            <div className="flex flex-col justify-between text-white w-1/3 pl-6">
                <div className="space-y-2">
                    <h3 className="text-base font-medium tracking-wide">Net Balance</h3>
                    <p className="text-2xl font-semibold">{asINR(props.netBalance)}</p>
                </div>
                <div className="flex gap-4">
                    <div>
                        <p className="text-white/90">Current Balance</p>
                        <p className="text-lg font-medium">{asINR(props.currentBalance)}</p>
                    </div>
                </div>
            </div>
            <div className="w-2/3 gap-4">
                <Carousel className="w-full" opts={{ align: 'start'}}>
                    <CarouselContent>
                        <CarouselItem className="basis-auto">
                            <StatCard
                                title="Deposits"
                                value={asINR(props.deposits)}
                                description="Includes all successful incoming transactions in the selected period."
                                icon={<ArrowDownCircle className="w-5 h-5"/>}/>
                        </CarouselItem>
                        <CarouselItem className="basis-auto">
                            <StatCard
                                title="Withdrawals"
                                value={asINR(props.withdrawals)}
                                description="Outgoing settlements and payouts processed within the range."
                                icon={<ArrowUpCircle className="w-5 h-5"/>}/>
                        </CarouselItem>
                        <CarouselItem className="basis-auto">
                            <StatCard
                                title="Settlements"
                                value={asINR(props.settlements)}
                                description="Includes all successful incoming transactions"
                                icon={<Receipt className="w-5 h-5"/>}/>
                        </CarouselItem>
                    </CarouselContent>
                </Carousel>
            </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <SubCard title="Reverse Withdrawals" value={asINR(props.reverseWithdrawals)} icon={<RotateCcw className="w-5 h-5"/>}/>
            <SubCard title="Commission" value={asINR(props.commission)} icon={<Percent className="w-5 h-5"/>}/>
            <SubCard title="ChargeBacks" value={asINR(props.chargebacks)} icon={<AlertTriangle className="w-5 h-5"/>}/>
            <SubCard title="Adjustments" value={asINR(props.adjustments)} icon={<IndianRupee className="w-5 h-5"/>}/>
        </div>
        </>
    )
}