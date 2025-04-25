import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        geist: ["Geist", "sans-serif"],
        geistMono: ["Geist Mono", "monospace"],
      },
    },
  },
  darkMode: "class",
  plugins: [],
};

export default config;
