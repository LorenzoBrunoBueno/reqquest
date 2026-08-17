/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '[data-dark="true"]'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        'primary-dark': 'var(--primary-dark)',
        secondary: 'var(--secondary)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        bg: 'var(--bg)',
        'card-bg': 'var(--card-bg)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        border: 'var(--border)',
        'sidebar-bg': 'var(--sidebar-bg)',
        'sidebar-text': 'var(--sidebar-text)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
      boxShadow: {
        DEFAULT: 'var(--shadow)',
      },
      fontFamily: {
        title: 'var(--font-title)',
        body: 'var(--font-body)',
      },
    },
  },
  plugins: [],
};
