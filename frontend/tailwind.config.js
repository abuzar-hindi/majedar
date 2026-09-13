/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./contexts/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-manrope)", "Manrope", "sans-serif"],
        serif: ["Bodoni Moda", "serif"],
        heading: ["var(--font-cormorant)", "Cormorant Garamond", "Georgia", "serif"],
        hero: ["var(--font-cinzel)", "Cinzel", "Georgia", "serif"],
      },
      colors: {
        warm: { 50: "#FAF8F5", 100: "#F5F1EA", 200: "#EAE3D5" },
        forest: { DEFAULT: "#1B3B2B", dark: "#11261B", light: "#2B523E" },
        sage: { 50: "#F2F7F4", 100: "#E3EFE8", 200: "#C7DEC8" },
        accent: { DEFAULT: "#C85A17", hover: "#B04B0F", light: "#FDF2EC" },
      },
    },
  },
  plugins: [],
};
