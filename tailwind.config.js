import preset from '@qomicex/plugin-ui/tailwind-preset'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./weather-header.html",
    "./weather-card.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [preset],
}
