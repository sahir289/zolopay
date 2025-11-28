import { cn } from "@/lib/utils"
import { ReactNode } from "react"

type StatCardProps = {
    title: string,
    description: string,
    value: string,
    icon: ReactNode,
    className?: string,
}

export default function StatCard (props: StatCardProps) {

    return (
        <>
        <div className={cn(
            "bg-gradient-to-br from-[#ffffff55] to-[#ffffff20] shrink-0 rounded-lg relative overflow-hidden w-64 sm:w-72 h-40 text-white select-none",
            props.className
        )}>
            
            <div className="absolute inset-0 p-5 flex flex-col justify-between rounded-lg border border-white/10">
                <div className="flex items-center justify-between">
                    <h2 className={cn(
                        "text-base font-medium"
                    )}>{props.title}</h2>
                    {props.icon}
                </div>
                <div className={cn("")}>
                    <p className="text-lg font-semibold tracking-wide">{props.value}</p>
                    <p className="mt-1 text-xs font-medium">{props.description}</p>
                </div>
            </div>
        </div>
        </>
    )
}