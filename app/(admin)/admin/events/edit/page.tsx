import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import HistoricalEventsTable from "@/components/admin/HistoricalEvents.table";

export default function Page() {

    return (
        <div>
            <div className="px-5 py-2.5">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Event</CardTitle>
                        <CardDescription>
                            Go back and select an event to edit
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        Error: Must have an event selected
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}