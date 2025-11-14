import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2E90FA",
          600: "#1B6FD8",
          700: "#1459AE",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
