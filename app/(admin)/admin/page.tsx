"use client";
import {PhotogVsModelChart} from "@/components/admin/dashboard/photogVsModel.chart";
import {Card, CardContent} from "@/components/ui/card";
import {AttendanceChart} from "@/components/admin/dashboard/attendance.chart";
import UpcomingEventsTable from "@/components/admin/dashboard/upcomingEvents.table";
import {useMember} from "@/app/hooks/useMember";
import {Loading} from "@/components/nav/Loading";

export default function Page() {
    const { loading, user } = useMember();
    if (loading) return (<Loading />);


    return (
        <>
            {(user.memberType === "SUPER_ADMIN" || user.memberType === "GROUP_ADMIN") &&

        <div className="page p-3">
            <div>
                <h1 className="m-2 text-3xl">Admin Dashboard</h1>
            </div>
            <div className="page flex-1 flex items-center min-h-0">
                <Card className="sm:w-1/2 md:w-1/3 m-2">
                    <CardContent>
                        <PhotogVsModelChart/>
                    </CardContent>
                </Card>

                <Card className="w-1/3 m-2">
                    <CardContent>
                        <AttendanceChart/>
                    </CardContent>
                </Card>

            </div>
            <div>
                <Card className="m-2">
                    <CardContent>
                        <UpcomingEventsTable/>
                    </CardContent>
                </Card>

            </div>
        </div>
    }
        </>
    )
}
      