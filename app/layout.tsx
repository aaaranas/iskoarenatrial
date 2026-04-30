import { DM_Sans, Space_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TRPCProvider } from "@/components/providers/trpc-provider";
import './globals.css';

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

interface RootLayoutProps {
  children: React.ReactNode;
}


export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${dmSans.variable} ${spaceMono.variable}`} suppressHydrationWarning>
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
