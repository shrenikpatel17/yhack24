import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        MonoSemiBold: ["MonoSemiBold"],
        MonoReg: ["MonoReg"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'grad-light': '#F1F6F0',
        'grad-dark' : '#C1D1BE',
        'text-green': '#044723',
        'hover-dark-green':'#003318',
        'icon-color': '#547A51',
        'bg-color': '#FEFFFC',
        'hover-light':'#f2f9f0',
      },
    },
  },
  plugins: [],
};
export default config;
