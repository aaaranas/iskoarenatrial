"use client";

import { Button } from '@/components/ui/button'

// CTA props — Login is the only auth entry on the public landing.
interface CallToActionProps {
    onLoginClick: () => void;
}

// Smooth-scrolls to the embedded Schedules section.
const scrollToSchedules = () => {
    const el = document.getElementById('schedules');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export default function CallToAction({ onLoginClick }: CallToActionProps) {
    return (
        <section className="py-16">
            <div className="mx-auto max-w-5xl rounded-3xl border px-6 py-12 md:py-20 lg:py-32">
                <div className="text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-5xl">Enter the Arena</h2>
                    <p className="mt-4">Stay on top of every play. Access live scores, real-time standings, and the full schedule of UP Cebu’s biggest sporting events.</p>

                    <div className="mt-12 flex flex-wrap justify-center gap-4">
                        {/* Primary: Login (UP maroon, opens login modal) */}
                        <Button
                            size="lg"
                            onClick={onLoginClick}
                            className="bg-[#7B1113] text-white hover:bg-[#5C0D0F]">
                            <span>Login</span>
                        </Button>

                        {/* Secondary: View Schedules (anchor scroll, no auth needed) */}
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={scrollToSchedules}>
                            <span>View Schedules</span>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
