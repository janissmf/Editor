/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0A1120',
        foreground: '#E2E8F0',
        muted: {
          DEFAULT: '#1E293B',
          foreground: '#94A3B8'
        },
        border: '#1E293B',
        input: '#1E293B',
        ring: '#1E293B'
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#E2E8F0',
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
              borderLeftColor: '#1E293B',
            },
            'h1,h2,h3,h4': {
              color: 'inherit',
            },
            hr: {
              borderColor: '#1E293B',
            },
            strong: {
              color: 'inherit',
            },
            code: {
              color: 'inherit',
              background: '#0F172A',
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