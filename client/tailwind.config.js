/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#F9FAFB", // app background
        surface: "#FFFFFF", // cards/containers
        text: {
          primary: "#1F2937", // near black
          secondary: "#6B7280", // medium gray
          disabled: "#9CA3AF", // light gray
        },
        primary: {
          main: "#6c4fe0ff", // brand purple
          light: "#A78BFA",
          dark: "#4C1D95",
        },
        success: "#16A34A",
        error: "#EF4444",
        warning: "#F59E0B",
        border: "#E5E7EB",
      },
      fontFamily: {
        montserrat: ["Montserrat"], // regular
        montserratBold: ["Montserrat-Bold"], // bold
        montserratSemiBold: ["Montserrat-SemiBold"], // semibold
      },
    },
  },
  plugins: [],
};
