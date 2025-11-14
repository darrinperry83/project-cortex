import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Base colors from design tokens
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        text: "var(--color-text)",
        muted: "var(--color-muted)",
        border: "var(--color-border)",

        // Brand colors
        brand: {
          DEFAULT: "var(--brand-500)",
          500: "var(--brand-500)",
          600: "var(--brand-600)",
          700: "var(--brand-700)",
        },

        // Semantic colors
        ok: {
          DEFAULT: "var(--ok-500)",
          500: "var(--ok-500)",
        },
        warn: {
          DEFAULT: "var(--warn-500)",
          500: "var(--warn-500)",
        },
        danger: {
          DEFAULT: "var(--danger-500)",
          500: "var(--danger-500)",
        },
        info: {
          DEFAULT: "var(--info-500)",
          500: "var(--info-500)",
        },
      },

      fontFamily: {
        sans: "var(--font-sans)",
        mono: "var(--font-mono)",
      },

      fontSize: {
        xs: "var(--text-xs)",
        sm: "var(--text-sm)",
        md: "var(--text-md)",
        lg: "var(--text-lg)",
        xl: "var(--text-xl)",
        "2xl": "var(--text-2xl)",
      },

      spacing: {
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        6: "var(--space-6)",
        8: "var(--space-8)",
      },

      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },

      boxShadow: {
        sm: "var(--shadow-1)",
        md: "var(--shadow-2)",
      },

      transitionDuration: {
        fast: "var(--dur-fast)",
        med: "var(--dur-med)",
        slow: "var(--dur-slow)",
      },

      transitionTimingFunction: {
        emph: "var(--ease-emph)",
      },
    },
  },
  plugins: [],
} satisfies Config;
