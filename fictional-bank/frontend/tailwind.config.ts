import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bank: {
          blue: "#0B3D91",
          blueLight: "#1E5FCC",
          gray: "#F4F6F8",
          grayDark: "#1E2530",
        },
      },
    },
  },
  plugins: [],
};
export default config;
