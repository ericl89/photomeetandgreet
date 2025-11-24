"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"


const chartData = [
    { month: "January", photographers: 5, models: 3 },
    { month: "February", photographers: 7, models: 4 },
    { month: "March", photographers: 2, models: 6 },
    { month: "April", photographers: 10, models: 3 },
    { month: "May", photographers: 8, models: 6 },
    { month: "June", photographers: 11, models: 9 },
]

const chartConfig = {
    photographers: {
        label: "Photographers",
        color: "var(--chart-1)",
    },
    models: {
        label: "Models",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig

export function PhotogVsModelChart() {
    return (
        <div className="w-full h-full flex flex-col p-4">
            <div className="flex flex-col gap-1 pb-4 mb-4 border-b">
                <h3 className="text-lg font-semibold">Attendance - Photographers vs Models</h3>
                <p className="text-sm text-muted-foreground">January - June 2024</p>
            </div>
            <div className="flex-1 flex items-center justify-center min-h-0">
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dashed" />}
                        />
                        <Bar dataKey="photographers" fill="var(--color-photographers)" radius={4} />
                        <Bar dataKey="models" fill="var(--color-models)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </div>
            <div className="flex flex-col items-start gap-2 text-sm pt-4 border-t">
                <div className="flex gap-2 leading-none font-medium">
                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                    Showing total attendees for the last 6 months
                </div>
            </div>
        </div>
    )
}