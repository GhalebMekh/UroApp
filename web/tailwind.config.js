export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0A1628',
        'navy-2': '#0F1F38',
        steel: '#1B2B45',
        line: '#26384f',
        ink: '#E8EEF6',
        muted: '#92A4BD',
        'muted-2': '#6B7A8E',
        violet: '#8B7CF6',
        'violet-soft': '#b4a9fa',
        teal: '#14B8A6',
        amber: '#F59E0B',
        crimson: '#DC2626',
      },
      fontFamily: {
        display: ['Times New Roman', 'Times', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
};
