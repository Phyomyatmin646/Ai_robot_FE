/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#F7F8FC',
          light: '#FBF8FF',
          dark: '#171827',
        },
        surface: {
          pure: '#FFFFFF',
          dim: '#D9D8ED',
          bright: '#FBF8FF',
          lowest: '#FFFFFF',
          low: '#F5F2FF',
          DEFAULT: '#EEECFF',
          high: '#E7E6FC',
          highest: '#E2E0F6',
          variant: '#E2E0F6',
        },
        primary: {
          DEFAULT: '#7562F6', // Electric Violet
          base: '#5741D7',
          hover: '#8B7CFF',
          container: '#705DF1',
          fixed: '#E4DFFF',
          'fixed-dim': '#C7BFFF',
          'on-fixed': '#170065',
        },
        secondary: {
          DEFAULT: '#5846C8',
          container: '#7161E3',
          fixed: '#E4DFFF',
        },
        aether: {
          DEFAULT: '#53B7E8', // Aether Cyan
          dark: '#006386',
          container: '#007DA8',
          glow: 'rgba(83, 183, 232, 0.4)',
        },
        neutral: {
          void: '#171827',
          charcoal: '#191A29',
          slate: '#85899A',
          'slate-light': '#9D9FA8',
          variant: '#474554',
          border: '#E9EAF2',
          'border-dark': '#C8C4D7',
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#BA1A1A',
          idle: '#85899A',
          speaking: '#7562F6',
          listening: '#53B7E8',
          thinking: '#8B7CFF',
        }
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 4px 24px -2px rgba(23, 24, 39, 0.04), 0 1px 2px rgba(23, 24, 39, 0.02)',
        glass: '0 12px 32px -4px rgba(117, 98, 246, 0.08), 0 4px 12px rgba(23, 24, 39, 0.03)',
        floating: '0 20px 40px -8px rgba(117, 98, 246, 0.16)',
        'glow-violet': '0 0 0 1px rgba(117, 98, 246, 0.4), 0 8px 30px rgba(117, 98, 246, 0.18)',
        'glow-cyan': '0 0 0 1px rgba(83, 183, 232, 0.4), 0 8px 30px rgba(83, 183, 232, 0.22)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.04)' },
        },
        'ripple': {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        'waveform': {
          '0%, 100%': { height: '12%' },
          '50%': { height: '85%' },
        }
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple': 'ripple 2s cubic-bezier(0, 0.2, 0.8, 1) infinite',
        'waveform': 'waveform 1.2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}

