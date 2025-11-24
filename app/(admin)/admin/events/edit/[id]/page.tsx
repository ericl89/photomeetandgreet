'use client';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import React, {useState, useEffect} from "react";
import EditEvent from "@/components/admin/events/EditEvent";

export default function Page({ params }: { params: { never } }) {
    const { id } = React.use(params)
    const [eventData, setEventData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {

        const controller = new AbortController();

        const getData = async() => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/admin/events/${id}`, {
                    signal: controller.signal,
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                console.log("data: ",data);
                setEventData(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }

        getData();
        return () => controller.abort();
    },[id])

    //console.log("params: ", params)

    return (
        <div>
            <div className="px-5 py-2.5">
                {loading && <div>Loading...</div>}

                {error && <div>An error has occurred, please try again.</div>}

                {!loading && !error &&
                <Card>
                    <CardHeader>
                        <CardTitle>Past Events</CardTitle>
                        <CardDescription>
                            {id &&
                                <div>Event:  {id}</div>
                            }

                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <EditEvent eData={eventData[0]} id={id}/>
                    </CardContent>
                </Card>
                }


            </div>
        </div>
    )
}