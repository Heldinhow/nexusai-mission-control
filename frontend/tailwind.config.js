/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        neon: {
          cyan: '#00f5ff',
          purple: '#b829f7',
          blue: '#3b82f6',
          green: '#10b981',
        },
        slate: {
          950: '#020617',
          900: '#0f172a',
          850: '#0b1221',
          800: '#1e293b',
        },
      },
    },
  },
  plugins: [],
}
