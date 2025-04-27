/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'inherit',
            a: {
              color: '#3b82f6',
              '&:hover': {
                color: '#2563eb',
              },
            },
            p: {
              color: 'inherit',
            },
            li: {
              color: 'inherit',
            },
            blockquote: {
              color: 'inherit',
              borderLeftColor: '#475569',
            },
            'h1,h2,h3,h4': {
              color: 'inherit',
            },
            hr: {
              borderColor: '#475569',
            },
            strong: {
              color: 'inherit',
            },
            code: {
              color: 'inherit',
              background: '#1e293b',
              padding: '2px 4px',
              borderRadius: '4px',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};