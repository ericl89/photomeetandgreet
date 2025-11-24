
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

import {Card, CardContent} from "@/components/ui/card";

export default function Page() {


    return (
            <div>
                <Card className={"max-w-206 m-5"}>
                <CardContent>
                <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                    defaultValue="item-1"
                >
                    <AccordionItem value="item-1">
                        <AccordionTrigger>What's this all about?</AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-4 text-balance">
                            <p>
                                The Photography & Model meetup groups are a way for models and photographers
                                to connect in a safe setting.
                            </p>
                            <p>
                                Use our meets to meet models/photographers, practice a skill, or just hang out
                                with like-minded people!
                            </p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>Does it cost?</AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-4 text-balance">
                            <p>
                                No! All of our events are 100% free! The only exception is if an event takes place
                                somewhere that has a small entry fee. Ex: A state park.
                            </p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>Can I use my cell phone to take photos?</AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-4 text-balance">
                            <p>
                                No. We require a DSLR or Mirrorless camera for all photographers.
                            </p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>How does it work?</AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-4 text-balance">
                            <p>
                                We use a shootout style format. If you're working with a model, another photographer
                                might jump in and start shooting next to you at any moment.
                            </p>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                </CardContent>
                </Card>
            </div>
    )
}