/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#002868",
        "primary-hover": "#001a4d",
        accent: "#CE1126",
        background: {
          light: "#f8fafc",
          dark: "#0f172a",
        },
        card: {
          light: "#ffffff",
          dark: "#1e293b",
        },
        text: {
          primary: "#0f172a",
          secondary: "#475569",
          light: "#f1f5f9",
          muted: "#94a3b8",
        },
      },
      fontFamily: {
        sans: ['"Roboto", sans-serif'],
        display: ['"Poppins", sans-serif'],
      },
    },
  },
  // plugins: [require("@tailwindcss/forms")],
};
