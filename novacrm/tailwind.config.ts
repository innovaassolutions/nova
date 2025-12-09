import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Catppuccin Mocha Base Colors
        'mocha-base': '#1e1e2e',
        'mocha-mantle': '#181825',
        'mocha-crust': '#11111b',
        'mocha-surface0': '#313244',
        'mocha-surface1': '#45475a',
        'mocha-surface2': '#585b70',

        // Catppuccin Mocha Text Colors
        'mocha-text': '#cdd6f4',
        'mocha-subtext0': '#a6adc8',
        'mocha-subtext1': '#bac2de',
        'mocha-overlay0': '#6c7086',
        'mocha-overlay1': '#7f849c',
        'mocha-overlay2': '#9399b2',

        // Innovaas Brand Colors
        'innovaas-orange': '#F25C05',
        'innovaas-orange-hover': '#D94C04',
        'innovaas-orange-soft': '#ff7b3d',

        // Catppuccin Mocha Accents
        'mocha-blue': '#89b4fa',
        'mocha-sapphire': '#74c7ec',
        'mocha-teal': '#94e2d5',
        'mocha-green': '#a6e3a1',
        'mocha-yellow': '#f9e2af',
        'mocha-peach': '#fab387',
        'mocha-red': '#f38ba8',
        'mocha-lavender': '#b4befe',
        'mocha-mauve': '#cba6f7',
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta-sans)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        orange: '0 4px 12px rgba(242, 92, 5, 0.3)',
      },
    },
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1440px',
    },
  },
  plugins: [],
};
export default config;
