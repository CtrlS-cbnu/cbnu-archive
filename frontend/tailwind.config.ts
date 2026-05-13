import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // CBNU (충북대학교) official burgundy/dark-red palette
        primary: {
          50:  '#fdf2f4',
          100: '#fae0e5',
          200: '#f4c0cb',
          300: '#ec90a2',
          400: '#e06078',
          500: '#cc3355',
          600: '#a8143a',  // CBNU main burgundy
          700: '#8c0f30',
          800: '#6e0d27',
          900: '#4d091c',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
