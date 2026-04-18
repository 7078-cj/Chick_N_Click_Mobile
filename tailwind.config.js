module.exports = {
  content: ["./app.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#FD5602",
          light: "#FE6B00",
          gold: "#FF8D03",
          soft: "#FFAF42",
          cream: "#FEDEBE",
          surface: "#F5F5F5",
        },
      },
    },
  },
  plugins: [],
};
