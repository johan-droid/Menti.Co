import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          light: "#FDFDFD",
          blue: "#E8F0FE",
          mint: "#e0f2f1", // Soft Mint
          lavender: "#ede7f6", // Calming Lavender
          peach: "#FCE8E6",
          yellow: "#FEF7E0",
          teal: "#e0f7fa", // Gentle Teal
        },
        empathetic: {
          teal: "#26a69a",
          lavender: "#7e57c2",
          mint: "#4db6ac",
          peach: "#ff8a65"
        },
        google: {
          blue: "#1A73E8",
          green: "#1E8E3E",
          red: "#D93025",
          yellow: "#F9AB00"
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%)',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'floating': '0 8px 30px rgba(0, 0, 0, 0.08)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      }
    }
  },
  plugins: []
};

export default config;
