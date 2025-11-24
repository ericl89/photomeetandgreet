'use client'
import {Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import UpcomingEventsTable from "@/components/admin/UpcomingEvents.table";
import HistoricalEventsTable from "@/components/admin/HistoricalEvents.table";
import {Button} from "@/components/ui/button";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link";
import {Loading} from "@/components/nav/Loading";
import {useMember} from "@/app/hooks/useMember";

export default function Page() {
    const {loading, user} = useMember();
    if (loading) return (<Loading/>);

    return (
        <>
            {(user.memberType === "SUPER_ADMIN" || user.memberType === "GROUP_ADMIN") &&
                <div>
                    <Breadcrumb className="mx-5 mt-3">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink>Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator/>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="/admin">Admin</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator/>
                            <BreadcrumbItem>
                                <BreadcrumbPage>Events</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="px-5 py-2.5">
                        <Card>
                            <CardHeader>
                                <CardTitle>Upcoming Events</CardTitle>
                                <CardDescription>
                                    List of upcoming events. Use this to grab the QR code for member sign-in.
                                </CardDescription>
                                <CardAction>
                                    <Button variant="link"><Link href="events/new">Create New Event</Link></Button>
                                </CardAction>
                            </CardHeader>
                            <CardContent>
                                <UpcomingEventsTable/>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="px-5 py-2.5">
                        <Card>
                            <CardHeader>
                                <CardTitle>Past Events</CardTitle>
                                <CardDescription>
                                    List of past events for historical purposes
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <HistoricalEventsTable/>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            }
        </>
    )
}