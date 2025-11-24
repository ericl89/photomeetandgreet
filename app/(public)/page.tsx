

import EventTable from "@/components/tables/eventTable";
import Link from "next/link";
import { Button } from "@/components/ui/button"

import {
    Announcement,
    AnnouncementTag,
    AnnouncementTitle,
} from '@/components/ui/shadcn-io/announcement';

export default function Page() {


    return (
            <div>
                <div className="flex flex-col gap-16 px-8 py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-8">
                        <Link href="#">
                            <Announcement>
                                <AnnouncementTag>Latest</AnnouncementTag>
                                <AnnouncementTitle>New website by Eric Lucky</AnnouncementTitle>
                            </Announcement>
                        </Link>
                        <h1 className="mb-0 text-balance font-medium text-6xl md:text-7xl xl:text-[5.25rem] max-w-[900]">
                            The best way to
                            network
                        </h1>
                        <p className="mt-0 mb-0 text-balance text-lg text-muted-foreground max-w-[900]">
                            The collection of photography meet and greet groups located all over the southeast is the
                            best and safest way for photographers to connect with models. Meet in a safe environment
                            with admins always present and practice your skills!
                        </p>
                        <div className="flex items-center gap-2">
                            <Button asChild>
                                <Link href="#">Get started</Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link className="no-underline" href="#">
                                    Learn more
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
                <EventTable/>
            </div>

    )
}