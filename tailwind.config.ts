import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./providers/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
      },
      keyframes: {
        "border-beam": {
          "100%": { "offset-distance": "100%" },
        },
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        // IskoArena design tokens — landing-page only.
        // Prefixed with `ia-` to avoid clashing with shadcn's --accent (neutral gray) etc.
        ia: {
          maroon:   '#800000',  // Primary brand — official UP Maroon
          accent:   '#A91D3A',  // Live/urgent accent (pulsing badges, hot CTAs)
          gold:     '#D4AF37',  // Secondary — eyebrows, dividers
          bg:       '#060606',  // page background
          'bg-alt': '#080808',  // alternating section
          card:     '#0a0a0a',  // card surface
          'card-elev': '#0d0d0d', // footer card / focus card
        },
        // Per-college team colors used in standings, crests, match cards.
        college: {
          cos:  '#3B82F6', // College of Science (Scions)
          css:  '#10B981', // College of Social Sciences (Stallions)
          ccad: '#A78BFA', // College of Communication, Art and Design (Phoenix)
          som:  '#F59E0B', // School of Management (Tycoons)
        },
      },
      borderRadius: {
        xl: 'calc(var(--radius) + 4px)',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui'],
        maroons: ["Maroons Strong", "sans-serif"],
        // Design-spec fonts for the new landing page.
        bebas: ['var(--font-bebas)', 'sans-serif'],   // Display headlines (ISKOARENA, section heads)
        mono:  ['var(--font-mono)', 'ui-monospace'],  // JetBrains Mono — scores/timestamps with tabular-nums
      }
    }
  },
  plugins: [
    require("tailwindcss-animate"),
    function ({ addUtilities }: { addUtilities: any }) {
      addUtilities({
        ".transform-style-3d": {
          "transform-style": "preserve-3d",
        },
        ".clip-x": {
          'overflow-x': 'hidden',
        },
        ".perspective-1000": {
          perspective: "1000px",
        },
        ".rotate-x-12": {
          "--tw-rotate-x": "12deg",
          transform: "rotateX(var(--tw-rotate-x)) translateZ(var(--tw-translate-z,0))",
        },
        ".rotate-x-20": {
          "--tw-rotate-x": "20deg",
          transform: "rotateX(var(--tw-rotate-x)) translateZ(var(--tw-translate-z,0))",
        },
        ".translate-z-0": { "--tw-translate-z": "0px" },
        ".translate-z-10": { "--tw-translate-z": "10px" },
        ".translate-z-20": { "--tw-translate-z": "20px" },
      });
    },
  ],
};

export default config;