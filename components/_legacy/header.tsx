'use client'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import React from 'react'
import { cn } from '@/lib/utils'

// Public-view nav: each href is a section id rendered on the landing page.
// "About Us" = developer team section, "Team" = participating colleges.
const menuItems = [
    { name: 'Schedules', href: '#schedules' },
    { name: 'Sponsors', href: '#sponsors' },
    { name: 'Team', href: '#team' },
    { name: 'FAQ', href: '#faq' },
    { name: 'About Us', href: '#about' },
]

// Login-only header — public users cannot sign up; admins issue credentials.
interface HeroHeaderProps {
    onLoginClick: () => void;
}

export const HeroHeader = ({ onLoginClick }: HeroHeaderProps) => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Closes the mobile menu after firing the auth action.
    const handleAuthAction = (action: () => void) => {
        action();
        setMenuState(false);
    }

    // Logo click — smooth-scroll back to the very top of the landing page.
    const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const top = document.getElementById('top');
        if (top) top.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
        setMenuState(false);
    }

    // Menu link click — close mobile menu; smooth scroll handled by CSS (scroll-behavior).
    const handleMenuClick = () => setMenuState(false);

    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="fixed z-50 w-full px-2">
                <div className={cn(
                    'mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12',
                    isScrolled && 'bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5'
                )}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full justify-between lg:w-auto">
                            {/* Logo + text both scroll to top via handleLogoClick */}
                            <Link
                                href="#top"
                                onClick={handleLogoClick}
                                aria-label="Scroll to top"
                                className="flex items-center space-x-2">
                                <Logo />
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden text-foreground">
                                <Menu className={cn("m-auto size-6 duration-200", menuState && "rotate-180 scale-0 opacity-0")} />
                                <X className={cn("absolute inset-0 m-auto size-6 duration-200", !menuState ? "-rotate-180 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100")} />
                            </button>
                        </div>

                        {/* Desktop Menu */}
                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-8 text-sm font-medium">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            onClick={handleMenuClick}
                                            className="text-muted-foreground hover:text-foreground block duration-150">
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Right Side Actions — Login only */}
                        <div className={cn(
                            "bg-background lg:bg-transparent hidden w-full lg:flex lg:w-fit items-center justify-end gap-6",
                            menuState && "block absolute top-full left-0 mt-2 p-6 rounded-3xl border shadow-2xl"
                        )}>
                            {/* Mobile menu items mirror desktop */}
                            <div className="lg:hidden mb-6">
                                <ul className="space-y-6 text-base font-medium">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                onClick={handleMenuClick}
                                                className="text-muted-foreground hover:text-foreground block duration-150">
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit items-center">
                                {/* UP maroon (#7B1113) Login — only auth entry on the public landing */}
                                <Button
                                    size="sm"
                                    onClick={() => handleAuthAction(onLoginClick)}
                                    className="w-full sm:w-auto bg-[#7B1113] text-white hover:bg-[#5C0D0F]">
                                    <span>Login</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}
