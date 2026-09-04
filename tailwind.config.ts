import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        press: "#0b0a09",
        paper: "#f2f1ed",
        ink: "#1d1c19",
        cream: "#fffaea",
      },
      fontFamily: {
        sans: ["Jost", "Futura", "sans-serif"],
        title: ["Jost", "Futura", "sans-serif"],
        mono: ["Jost", "Futura", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
