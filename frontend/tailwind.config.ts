import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paypal: {
          navy: "#003087",
          blue: "#0070E0",
          light: "#009CDE",
          surface: "#F0F7FD",
          bg: "#F5F7FA",
          card: "#FFFFFF",
          text: "#001435",
          secondary: "#536477",
          border: "#DDE3EA",
          success: "#00875A",
          gold: "#FFC439",
          goldHover: "#F2B82E",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "PayPalSansSmall",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
