import type { Config } from "tailwindcss";

// Tokens are the single source of color/type truth for the app, mirroring
// DESIGN_GUIDELINES.md sections 2-3. Do NOT use default Tailwind colors for
// anything user-facing — only these named tokens.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    // Replace the default palette entirely so stray default colors are obvious.
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: "#FFFFFF",
      navy: {
        900: "#0B1F3A", // header bar, tab rail, PDF header
        700: "#16365C", // active tab, primary button hover
      },
      slate: {
        100: "#F3F5F8", // app background
      },
      ink: "#1A2433", // primary text
      steel: "#5B6B82", // secondary text, labels
      signal: { red: "#C0392B" }, // expired / overdue
      amber: "#C77D1F", // expiring <=60d / due <=14d
      ops: { green: "#1F7A4D" }, // compliant / on track
      gold: "#B9962E", // single accent: Generate Weekly Report, active chips
      border: "#E3E8EF", // card / table hairlines
      "banner-red": "#FBEAE8", // overdue banner fill
    },
    fontFamily: {
      // Wired to next/font CSS variables defined in layout.tsx.
      sans: ["var(--font-plex-sans)", "system-ui", "sans-serif"],
      condensed: ["var(--font-plex-condensed)", "system-ui", "sans-serif"],
      mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      // Apple New York preferred; Newsreader web fallback for non-Apple/Loom.
      serif: ['ui-serif', '"New York"', "var(--font-newsreader)", "Georgia", "serif"],
    },
    extend: {
      fontSize: {
        // Scale from DESIGN_GUIDELINES.md section 3.
        label: ["11px", { lineHeight: "1.2", letterSpacing: "0.08em" }],
        table: ["13px", { lineHeight: "1.45" }],
        ui: ["14px", { lineHeight: "1.5" }],
        section: ["16px", { lineHeight: "1.4" }],
        title: ["24px", { lineHeight: "1.2" }],
        strip: ["44px", { lineHeight: "1" }],
        // Serif display scale (H1/H2) + the huge stat numeral.
        h1: ["30px", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        h2: ["20px", { lineHeight: "1.25", letterSpacing: "-0.005em" }],
        stat: ["52px", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
      },
      borderRadius: { card: "8px" },
      boxShadow: {
        // The single permitted elevation — nothing heavier.
        card: "0 1px 2px rgba(11,31,58,.06)",
      },
      transitionTimingFunction: { ops: "cubic-bezier(0.4, 0, 0.2, 1)" },
      transitionDuration: { 150: "150ms" },
    },
  },
  plugins: [],
};

export default config;
