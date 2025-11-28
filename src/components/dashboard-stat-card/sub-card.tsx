import { cn } from "@/lib/utils"
import { ReactNode } from "react"

type SubCardProps = {
    title: string,
    value: string,
    icon: ReactNode,
    className?: string,
}

export default function SubCard (props: SubCardProps) {

    return (
        <>
        <div className={cn(
            "rounded-lg overflow-hidden select-none p-3 border border-gray-200 dark:border-dark-600",
            props.className
        )}>
            <div className="flex justify-between gap-1">
                <h2 className={cn(
                    "text-xl font-semibold text-gray-800 dark:text-dark-100"
                )}>{props.title}</h2>
                {props.icon}
            </div>
            <p className="mt-1 truncate text-xs-plus">{props.value}</p>
        </div>
        </>
    )
}