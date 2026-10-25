/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090714",
        surface: "#120e24",
        border: "#251d45",
        brand: {
          50: "#1a1338",
          100: "#261a4f",
          200: "#3d2882",
          300: "#5b3ec9",
          400: "#7c5ce9",
          500: "#7053de",
          600: "#6d57d9",
          700: "#5b43cc",
          800: "#4934aa",
          900: "#382787",
          950: "#1d1248",
        },
        ink: {
          primary: "#f8fafc",
          secondary: "#a1a1aa",
          muted: "#71717a",
          subtle: "#2d2454",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
