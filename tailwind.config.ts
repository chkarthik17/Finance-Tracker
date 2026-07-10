import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Smooth Dark Theme
        'dark-bg': '#0f1419',
        'dark-card': '#1a1f2e',
        'dark-border': '#2d3748',
        'dark-hover': '#252b3b',
        'neon-blue': '#60a5fa',
        'neon-purple': '#a78bfa',
        'neon-pink': '#ec4899',
        'neon-green': '#34d399',
        'neon-orange': '#fb923c',
        'gaming-accent': '#8b5cf6',

        // Original colors (fallback)
        ink: "#1B1B18",
        paper: "#FAF7F2",
        ledger: "#0F3D2E",
        rust: "#B5502A",
        gold: "#C79A3C",
        line: "#DDD6C8",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        gaming: ["-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          'from': { boxShadow: '0 0 5px #00d4ff, 0 0 10px #00d4ff' },
          'to': { boxShadow: '0 0 10px #00d4ff, 0 0 20px #00d4ff, 0 0 30px #00d4ff' }
        },
        slideIn: {
          'from': { transform: 'translateY(-10px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' }
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' }
        }
      },
      backgroundImage: {
        'gaming-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0a0e17 0%, #1a1f2e 100%)',
      }
    },
  },
  plugins: [],
};

export default config;
