import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // ADD THIS ENTIRE SAFELIST BLOCK:
  safelist: [
    'col-span-12',
    'md:col-span-2',
    'md:col-span-3',
    'md:col-start-1',
    'md:col-start-4',
    'md:col-start-7',
    'md:col-start-11',
    'md:-mt-16',
    'md:mt-12',
    'md:mt-24',
    'aspect-[3/4]',
    'aspect-[4/5]',
    'aspect-square',
    'aspect-[1/2]'
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      // (Keep your existing font configurations here if you have them)
    },
  },
  plugins: [],
};
export default config;