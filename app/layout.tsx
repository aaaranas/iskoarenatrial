import { DM_Sans, JetBrains_Mono, Bebas_Neue } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TRPCProvider } from "@/components/providers/trpc-provider";
import './globals.css';

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
