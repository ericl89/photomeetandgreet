'use client'
import * as React from "react"

import { useForm, SubmitHandler, Controller } from "react-hook-form"
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {Button} from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import {Textarea} from "@/components/ui/textarea";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import Link from "next/link";
import axios from 'axios';


type Inputs = {
    groupId: string
    title: string
    address: string
    eventDate: Date
    startsAt: string
    endsAt: string
    timezone: string
}

export default function CreateEvent() {
    const {
        handleSubmit,
        control,
        formState: {errors},
    } = useForm<Inputs>()

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        console.log(data)
        axios.post('/api/admin/events', data)
            .then(function (response) {
            console.log(response);
            })
            .catch(function (error) {
                console.log(error);
            });
    }


    return (
        <div className="not-prose mx-auto max-w-[530px] p-8">
            <div className="mb-8 text-center">
                <h1 className="mb-2 font-semibold text-3xl tracking-tight">
                    Create Event
                </h1>
                <p className="text-balance text-muted-foreground">
                    Fill out the form below to create a new event
                </p>
            </div>

            <Card>
                <CardContent>
                    <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-2">
                            <Label htmlFor="organizer">Group</Label>
                            <Controller
                                name="groupId"
                                control={control}
                                rules={{
                                    required: true,
                                }}
                                render={({ field: { onChange, onBlur, value, ref } }) => <Select onValueChange={onChange} value={value}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Group</SelectLabel>
                                            {/*todo dynamically generate groups*/}
                                            <SelectItem value="1">Central Alabama</SelectItem>
                                            <SelectItem value="2">North Alabama</SelectItem>
                                            <SelectItem value="3">Chattanooga / North Georgia</SelectItem>
                                            <SelectItem value="4">Eastern Alabama</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>}
                            />
                            {errors.groupId?.type === "required" && (
                                <p role="alert" className="alert">*Group is required</p>
                            )}

                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="organizer">Title</Label>
                            <Controller
                                name="title"
                                control={control}
                                rules={{
                                    required: true,
                                }}
                                render={({ field }) => <Input
                                    id="title"
                                    placeholder="Enter event title"
                                    required
                                    {...field}
                                />}
                            />
                            {errors.title?.type === "required" && (
                                <p role="alert" className="alert">*Title is required</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="organizer">Address / Location</Label>
                            <Controller
                                name="address"
                                control={control}
                                rules={{
                                    required: true,
                                }}
                                render={({ field }) => <Textarea
                                        id="address"
                                        placeholder="Enter event location"
                                        required
                                        {...field}
                                    />}
                            />
                            {errors.address?.type === "required" && (
                                <p role="alert" className="alert">*Address is required</p>
                            )}
                        </div>

                        <div className="space-y-2">
                                <div className="flex flex-col gap-3 w-full">
                                    <Label htmlFor="date" className="px-1">
                                        Event Date
                                    </Label>
                                    <div className="relative flex gap-2">
                                        <Controller
                                            name="eventDate"
                                            control={control}
                                            rules={{
                                                required: true,
                                            }}
                                            render={({ field }) => (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={`w-[280px] justify-start text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={(day) => field.onChange(day ?? undefined)}
                                                            // Optional: constrain selectable dates
                                                            disabled={(date) => date < new Date()}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            )}
                                        />
                                    </div>
                                </div>
                                {errors.eventDate?.type === "required" && (
                                    <p role="alert" className="alert">*Event date is required</p>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 my-4">
                                <div className="space-y-2">
                                    <Label htmlFor="event-name">Start Time</Label>
                                    <Controller
                                        name="startsAt"
                                        control={control}
                                        rules={{
                                            required: true,
                                        }}
                                        render={({ field }) => <Input
                                            id="start-time"
                                            placeholder="00:00"
                                            required
                                            {...field}
                                        />}
                                    />
                                    {errors.startsAt?.type === "required" && (
                                        <p role="alert" className="alert">*Start time is required</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="organizer">End Time</Label>
                                    <Controller
                                        name="endsAt"
                                        control={control}
                                        rules={{
                                            required: true,
                                        }}
                                        render={({ field }) => <Input
                                            id="end-time"
                                            placeholder="00:00"
                                            required
                                            {...field}
                                        />}
                                    />
                                    {errors.endsAt?.type === "required" && (
                                        <p role="alert" className="alert">*End time is required</p>
                                    )}
                                </div>
                            </div>


                        <div className="space-y-2">
                            <Label htmlFor="organizer">Timezone</Label>
                            <Controller
                                name="timezone"
                                control={control}
                                rules={{
                                    required: true,
                                }}
                                render={({ field: { onChange, onBlur, value, ref } }) => <Select onValueChange={onChange} value={value}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select event timezone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Timezone</SelectLabel>
                                            <SelectItem value="EDT">Eastern Daylight Time</SelectItem>
                                            <SelectItem value="CDT">Central Daylight Time</SelectItem>
                                            <SelectItem value="MDT">Mountain Daylight Time</SelectItem>
                                            <SelectItem value="PDT">Pacific Daylight Time</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>}
                            />
                            {errors.timezone?.type === "required" && (
                                <p role="alert" className="alert">*Timezone is required</p>
                            )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 my-4">
                            <div className="space-y-2 w-full">
                                <Link href="./"><Button variant="destructive" className="w-full cursor-pointer">Cancel</Button></Link>
                            </div>
                            <div className="space-y-2 w-full">
                                <Button className="w-full" >Create Event</Button>
                            </div>
                        </div>

                    </form>
                </CardContent>
            </Card>
        </div>
    )
}