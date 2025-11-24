'use client'
import {Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import UpcomingEventsTable from "@/components/admin/UpcomingEvents.table";
import {Button} from "@/components/ui/button";
import {Loading} from "@/components/nav/Loading";
import {useMember} from "@/app/hooks/useMember";
import MembersTable from "@/components/admin/Members.table";
import AdminTable from "@/components/admin/Admin.table";

export default function Page() {
    const { loading, user } = useMember();
    if (loading) return (<Loading />);
    return (
        <>
            {(user.memberType === "SUPER_ADMIN" || user.memberType === "GROUP_ADMIN") &&
                <div>
                    <div className="px-5 py-2.5">
                        <Card>
                            <CardHeader>
                                <CardTitle>Administrators</CardTitle>
                                <CardDescription>
                                    List of all group administrators
                                </CardDescription>
                                <CardAction>
                                    <Button variant="link">Add Administrator</Button>
                                </CardAction>
                            </CardHeader>
                            <CardContent>
                                <AdminTable/>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="px-5 py-2.5">
                        <Card>
                            <CardHeader>
                                <CardTitle>Attendees</CardTitle>
                                <CardDescription>
                                    List of all group attendees
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <MembersTable/>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            }
        </>

    )
}