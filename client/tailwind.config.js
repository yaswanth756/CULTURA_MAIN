/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        anzac: {
          '50': '#faf7ec',
          '100': '#f4eccd',
          '200': '#ead79e',
          '300': '#dab353',
          '400': '#d3a13c',
          '500': '#c48c2e',
          '600': '#a86d26',
          '700': '#875021',
          '800': '#714222',
          '900': '#613822',
          '950': '#381c10',
        },
      },
    },
  },
  plugins: [],
}
