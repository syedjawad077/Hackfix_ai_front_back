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
        paper: {
          DEFAULT: "#F5F1EA",
          dark: "#EAE4D9",
        },
        ink: {
          DEFAULT: "#1B1B1B",
          soft: "#5B574F",
        },
        line: {
          DEFAULT: "#D9D2C4",
        },
        signal: {
          DEFAULT: "#E8591A",
          dark: "#C94810",
        },
        background: "#F5F1EA",
        surface: {
          DEFAULT: "#EAE4D9",
          card: "#EAE4D9",
          hover: "#E2DCD1",
        },
        navy: {
          DEFAULT: "#1B1B1B",
          heading: "#1B1B1B",
        },
        slate: {
          subtle: "#5B574F",
        },
        brand: {
          primary: "#1B1B1B",
          hover: "#2A2A2A",
          accent: "#E8591A",
          tint: "#EAE4D9",
          "tint-hover": "#E2DCD1",
        },
        border: {
          soft: "#D9D2C4",
          strong: "#C4BCAC",
        },
        severity: {
          critical: {
            bg: "#FDE8EA",
            text: "#D7263D",
            border: "#F8B4BD",
          },
          high: {
            bg: "#FDEEE7",
            text: "#E8591A",
            border: "#F8C8B3",
          },
          medium: {
            bg: "#FEF7E6",
            text: "#8A6000",
            border: "#FBDFA0",
          },
          low: {
            bg: "#EDF7F1",
            text: "#2E734D",
            border: "#BFE4CE",
          },
        },
      },
      borderRadius: {
        none: "0px",
        sm: "4px",
        DEFAULT: "8px",
        md: "8px",
        lg: "8px",
        xl: "8px",
        "2xl": "8px",
        "3xl": "8px",
        chat: "8px",
        card: "8px",
        pill: "8px",
        full: "9999px",
      },
      fontFamily: {
        sans: [
          '"IBM Plex Sans"',
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        none: "none",
        soft: "none",
        card: "none",
        modal: "0 10px 25px -5px rgba(27, 27, 27, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
