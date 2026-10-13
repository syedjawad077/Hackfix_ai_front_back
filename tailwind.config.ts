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
        background: "#FFFFFF",
        surface: {
          DEFAULT: "#F4F7FB",
          card: "#F4F7FB",
          hover: "#EAF0F8",
        },
        navy: {
          DEFAULT: "#0B1F3A",
          heading: "#0B1F3A",
        },
        slate: {
          subtle: "#51627A",
        },
        brand: {
          primary: "#0F2A5C",
          hover: "#0A1F47",
          accent: "#2563EB",
          tint: "#E3ECFA",
          "tint-hover": "#D8E5F7",
        },
        border: {
          soft: "#D9E2F0",
          strong: "#BACADF",
        },
        severity: {
          critical: {
            bg: "#FEE2E2",
            text: "#991B1B",
            border: "#FCA5A5",
          },
          high: {
            bg: "#FFEDD5",
            text: "#C2410C",
            border: "#FDBA74",
          },
          medium: {
            bg: "#FEF3C7",
            text: "#B45309",
            border: "#FCD34D",
          },
          low: {
            bg: "#DBEAFE",
            text: "#1D4ED8",
            border: "#93C5FD",
          },
        },
      },
      borderRadius: {
        "chat": "16px",
        "card": "14px",
        "pill": "9999px",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 2px 8px -2px rgba(11, 31, 58, 0.06), 0 1px 3px -1px rgba(11, 31, 58, 0.04)",
        card: "0 4px 12px -2px rgba(11, 31, 58, 0.08)",
        modal: "0 20px 25px -5px rgba(11, 31, 58, 0.1), 0 8px 10px -6px rgba(11, 31, 58, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;

