import { cn } from "@/lib/utils";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import StatCard from "./stat-card";
import { ArrowLeftCircle, ArrowRightCircle, BadgeIndianRupee, BadgePercent, NotebookText } from "lucide-react";
import SubCard from "./sub-card";


export default function DashboardStatCard () {
    return (
        <>
        <div className={cn(
            "rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 py-5 sm:py-6 flex gap-6"
        )}>
            <div className="flex flex-col justify-between text-white w-1/3 pl-6">
                <div className="space-y-2">
                    <h3 className="text-base font-medium tracking-wide">Net Balance</h3>
                    <p className="text-2xl font-semibold">$655336.55</p>
                </div>
                <div className="flex gap-4">
                    <div>
                        <p className="text-white/90">Current Balance</p>
                        <p className="text-lg font-medium">$5604</p>
                    </div>
                </div>
            </div>
            <div className="w-2/3 gap-4">
                <Carousel className="w-full" opts={{ align: 'start'}}>
                    <CarouselContent>
                        <CarouselItem className="basis-auto">
                            <StatCard
                                title="Deposits"
                                value="$65022"
                                description="Includes all successful incoming transactions in the selected period."
                                icon={<BadgeIndianRupee className="w-5 h-5"/>}/>
                        </CarouselItem>
                        <CarouselItem className="basis-auto">
                            <StatCard
                                title="Withdrawals"
                                value="$6022"
                                description="Outgoing settlements and payouts processed within the range."
                                icon={<ArrowRightCircle className="w-5 h-5"/>}/>
                        </CarouselItem>
                        <CarouselItem className="basis-auto">
                            <StatCard
                                title="Settlements"
                                value="$635"
                                description="Includes all successful incoming transactions"
                                icon={<NotebookText className="w-5 h-5"/>}/>
                        </CarouselItem>
                    </CarouselContent>
                </Carousel>
            </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SubCard title="Reverse Withdrawals" value="$10" icon={<ArrowRightCircle className="w-5 h-5"/>}/>
            <SubCard title="Commission" value="$336" icon={<BadgePercent className="w-5 h-5"/>}/>
            <SubCard title="ChargeBacks" value="$310" icon={<ArrowLeftCircle className="w-5 h-5"/>}/>
            <SubCard title="Adjustments" value="$100" icon={<ArrowLeftCircle className="w-5 h-5"/>}/>
        </div>
        </>
    )
}