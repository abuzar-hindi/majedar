/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        serif: ["Bodoni Moda", "serif"],
        heading: ["Cormorant Garamond", "Georgia", "serif"],
        hero: ["Cinzel", "Georgia", "serif"],
      },
      colors: {
        warm: {
          50: "#FAF8F5",
          100: "#F5F1EA",
          200: "#EAE3D5",
        },
        forest: {
          DEFAULT: "#1B3B2B",
          dark: "#11261B",
          light: "#2B523E",
        },
        sage: {
          50: "#F2F7F4",
          100: "#E3EFE8",
          200: "#C7DEC8",
        },
        accent: {
          DEFAULT: "#C85A17",
          hover: "#B04B0F",
          light: "#FDF2EC",
        },
      },
    },
  },
  plugins: [],
};