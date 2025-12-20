/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './components/**/*.{js,ts,tsx}', './screens/**/*.{js,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter_400Regular'],
      },
      colors: {
        // Primary Brand Colors
        primary: {
          DEFAULT: '#0D9488', // Teal (Light Mode)
          dark: '#14B8A6',    // Lighter Teal (Dark Mode)
          hover: '#0F766E',   // Dark Teal
          'hover-dark': '#2DD4BF', // Bright Teal
        },
        secondary: {
          DEFAULT: '#6EE7B7', // Mint Green (Light Mode)
          dark: '#5EEAD4',    // Lighter Mint (Dark Mode)
        },

        // Background & Surface
        background: {
          light: '#FFFFFF',
          dark: '#0F172A',
        },
        surface: {
          light: '#F9FAFB',
          dark: '#1E293B',
        },
        card: {
          light: '#FFFFFF',
          dark: '#334155',
        },

        // Text Colors
        text: {
          primary: {
            light: '#1F2937',
            dark: '#F1F5F9',
          },
          secondary: {
            light: '#6B7280',
            dark: '#CBD5E1',
          },
          tertiary: {
            light: '#9CA3AF',
            dark: '#94A3B8',
          },
        },

        // Border Colors
        border: {
          light: '#E5E7EB',
          dark: '#334155',
          focus: {
            light: '#0D9488',
            dark: '#14B8A6',
          },
        },

        // Semantic Colors
        success: {
          light: '#10B981',
          dark: '#34D399',
        },
        error: {
          light: '#EF4444',
          dark: '#F87171',
        },
        warning: {
          light: '#F59E0B',
          dark: '#FBBF24',
        },
        info: {
          light: '#3B82F6',
          dark: '#60A5FA',
        },
      },
    },
  },
  plugins: [],
};
