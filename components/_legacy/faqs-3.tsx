'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { DynamicIcon, type IconName } from 'lucide-react/dynamic'
import Link from 'next/link'

type FAQItem = {
    id: string
    icon: IconName
    question: string
    answer: string
}

export default function FAQsThree() {
    const faqItems: FAQItem[] = [
        {
            id: 'item-1',
            icon: 'calendar',
            question: 'What is IskoArena and who can use it?',
            answer: 'IskoArena is the centralized platform for UP Cebu Intramurals. It is designed for students, faculty, staff, and alumni to track live game updates, view official schedules, and browse player statistics in one place.'       
	},

        {
            id: 'item-2',
            icon: 'trophy',
            question: 'How do I see the latest game results and standings?',
            answer: 'You can view real-time scores on the "Live Updates" tab. For overall rankings, head to the "Standings" section, which is updated immediately after game officials verify the score sheets.'
	},
        {
            id: 'item-3',
            icon: 'zap',
            question: "Where can I find the official schedule for upcoming matches?",
            answer: 'The "Schedules" tab provides a comprehensive calendar of all sporting events. You can filter by sport (e.g., Basketball, Volleyball, E-sports) or by date to make sure you never miss a game.'
	           
	},
        {
            id: 'item-4',
            icon: 'globe',
            question: 'Do you offer localized support?',
            answer: 'We offer multilingual support in English, Spanish, French, German, and Japanese. Our support team can assist customers in these languages via email, chat, and phone during standard business hours for each respective region.',
        },
        {
            id: 'item-5',
            icon: 'package',
            question: 'How do I track my order?',
            answer: 'Once your order ships, you\'ll receive a confirmation email with a tracking number. You can use this number on our website or the carrier\'s website to track your package. You can also view order status and tracking information in your account dashboard under "Order History".',
        },
    ]

    return (
        <section className="bg-muted dark:bg-background py-20">
            <div className="mx-auto max-w-5xl px-4 md:px-6">
                <div className="flex flex-col gap-10 md:flex-row md:gap-16">
                    <div className="md:w-1/3">
                        <div className="sticky top-20">
                            <h2 className="mt-4 text-3xl font-bold">Frequently Asked Questions</h2>
                            <p className="text-muted-foreground mt-4">
                                Can't find what you're looking for? Contact our{' '}
                                <Link
                                    href="#"
                                    className="text-primary font-medium hover:underline">
                                    customer support team
                                </Link>
                            </p>
                        </div>
                    </div>
                    <div className="md:w-2/3">
                        <Accordion
                            type="single"
                            collapsible
                            className="w-full space-y-2">
                            {faqItems.map((item) => (
                                <AccordionItem
                                    key={item.id}
                                    value={item.id}
                                    className="bg-background shadow-xs rounded-lg border px-4 last:border-b">
                                    <AccordionTrigger className="cursor-pointer items-center py-5 hover:no-underline">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-6">
                                                <DynamicIcon
                                                    name={item.icon}
                                                    className="m-auto size-4"
                                                />
                                            </div>
                                            <span className="text-base">{item.question}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-5">
                                        <div className="px-9">
                                            <p className="text-base">{item.answer}</p>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </div>
        </section>
    )
}
