import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Bebas_Neue } from "next/font/google";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { TRPCProvider } from "@/providers/TRPCProvider";
import './globals.css';

// Browser tab title + favicon + social previews (OpenGraph / Twitter cards).
// metadataBase resolves the relative image paths below to absolute URLs when scrapers (Messenger,
// Discord, Twitter, iMessage) fetch the page — without it, previews break on most platforms.
export const metadata: Metadata = {
  metadataBase: new URL("https://iskoarena-upc.vercel.app"),
  // `default` is shown when a child route doesn't set its own title (e.g. root /, /dashboard).
  // `template` lets child pages set just their segment ("Matches") and Next composes "Matches · IskoArena".
  title: {
    default: "IskoArena",
    template: "%s · IskoArena",
  },
  description: "UP Cebu intramural sports — live matches, leaderboards, and team pages.",
  // Points the favicon to /public/logo.png so the tab shows the IskoArena mark beside the title.
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  // OpenGraph — used by Facebook, Messenger, Discord, LinkedIn, iMessage when the link is shared.
  openGraph: {
    title: "IskoArena",
    description: "UP Cebu intramural sports — live matches, leaderboards, and team pages.",
    url: "https://iskoarena-upc.vercel.app",
    siteName: "IskoArena",
    // Preview card image — swap to a dedicated 1200x630 OG asset later if /app_screenshot.png looks off.
    images: [
      {
        url: "/app_screenshot.png",
        width: 1200,
        height: 630,
        alt: "IskoArena — UP Cebu intramural sports dashboard",
      },
    ],
    locale: "en_PH",
    type: "website",
  },
  // Twitter / X uses its own meta tags; "summary_large_image" gives the big banner card style.
  twitter: {
    card: "summary_large_image",
    title: "IskoArena",
    description: "UP Cebu intramural sports — live matches, leaderboards, and team pages.",
    images: ["/app_screenshot.png"],
  },
};

// Body / UI text — DM Sans
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });

// Numerics, scores, timestamps — JetBrains Mono with tabular-nums.
// Replaced Space Mono per the new design's typography spec.
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
});

// Display headlines — Bebas Neue (the design uses it for ISKOARENA wordmark + section titles).
const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas",
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  // Font CSS variables exposed to Tailwind via tailwind.config.ts → fontFamily.bebas / mono / sans
  return (
    <html lang="en" className={`${dmSans.variable} ${jetbrainsMono.variable} ${bebasNeue.variable}`} suppressHydrationWarning>
      <body>
	 {/* IskoArena is designed dark-first (dashboard, login modal, embedded sections all hardcode dark colors).
	     forcedTheme="dark" locks the app to dark mode so OS/system preference can't flip it to light, which
	     would render the hero text unreadable against the dark background photo. */}
	 <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            disableTransitionOnChange
          >
	  <TRPCProvider>
	   {children}
	  </TRPCProvider> 
	 </ThemeProvider>
      </body>
    </html>
  );
}