"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts"

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"


const chartData = [
    { month: "January", desktop: 8 },
    { month: "February", desktop: 11 },
    { month: "March", desktop: 8 },
    { month: "April", desktop: 13},
    { month: "May", desktop: 14 },
    { month: "June", desktop: 20 },
]

const chartConfig = {
    desktop: {
        label: "Attendees",
        color: "var(--chart-1)",
    }
} satisfies ChartConfig

export function AttendanceChart() {
    return (
        <div className="w-full h-full flex flex-col p-4">
            <div className="mb-4">
                <h3 className="text-lg font-semibold">Overall Attendance by Month</h3>
                <p className="text-sm text-muted-foreground">January - June 2024</p>
            </div>
            <div className="flex-1 flex items-center justify-center min-h-0">
                <ChartContainer config={chartConfig} className="w-full h-[270px]">
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            top: 20,
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <Line
                            dataKey="desktop"
                            type="natural"
                            stroke="var(--color-desktop)"
                            strokeWidth={2}
                            dot={{
                                fill: "var(--color-desktop)",
                            }}
                            activeDot={{
                                r: 6,
                            }}
                        >
                            <LabelList
                                position="top"
                                offset={12}
                                className="fill-foreground"
                                fontSize={12}
                            />
                        </Line>
                    </LineChart>
                </ChartContainer>
            </div>
            <div className="flex flex-col gap-1 text-sm mt-4">
                <div className="flex items-center gap-2 leading-none font-medium">
                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground flex items-center gap-2 leading-none">
                    Showing total visitors for the last 6 months
                </div>
            </div>
        </div>
    )
}