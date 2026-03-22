// tailwind.config.js — REPLACE ENTIRE FILE

/** @type {import('tailwindcss').Config} */
module.exports = {
  // next-themes toggles the 'dark' class on <html>
  darkMode: 'class',

  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
    './hooks/**/*.{js,jsx}',
  ],

  theme: {
    extend: {

      // ── Font Family ───────────────────────────────────────────────
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
        mono: ['monospace'],
      },

      // ── Color Tokens ─────────────────────────────────────────────
      // These reference CSS variables defined in globals.css
      // Use these everywhere — never hardcode hex in components
      colors: {

        // Page / surface backgrounds
        bg: {
          base:    'var(--bg-base)',     // page background — darkest
          raised:  'var(--bg-raised)',   // cards, panels
          overlay: 'var(--bg-overlay)', // modals, dropdowns
          subtle:  'var(--bg-subtle)',   // hover states, row highlights
          input:   'var(--bg-input)',    // form inputs
        },

        // Text hierarchy
        text: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary:  'var(--text-tertiary)',
          disabled:  'var(--text-disabled)',
          inverse:   'var(--text-inverse)',   // text on colored buttons
        },

        // Borders
        border: {
          DEFAULT: 'var(--border)',
          strong:  'var(--border-strong)',
          subtle:  'var(--border-subtle)',
        },

        // Brand — Electric Blue (primary actions)
        brand: {
          50:      '#eff6ff',
          100:     '#dbeafe',
          200:     '#bfdbfe',
          300:     '#93c5fd',
          400:     '#60a5fa',
          500:     '#3b82f6',
          600:     '#2563eb',
          700:     '#1d4ed8',
          800:     '#1e40af',
          900:     '#1e3a8a',
          DEFAULT: '#3b82f6',
        },

        // Semantic states
        success: {
          DEFAULT: '#10b981',
          bg:   'var(--success-bg)',
          text: 'var(--success-text)',
        },
        warning: {
          DEFAULT: '#f59e0b',
          bg:   'var(--warning-bg)',
          text: 'var(--warning-text)',
        },
        danger: {
          DEFAULT: '#ef4444',
          bg:   'var(--danger-bg)',
          text: 'var(--danger-text)',
        },
        info: {
          DEFAULT: '#3b82f6',
          bg:   'var(--info-bg)',
          text: 'var(--info-text)',
        },

        // Sidebar specific
        sidebar: {
          bg:     'var(--sidebar-bg)',
          border: 'var(--sidebar-border)',
        },
      },

      // ── Border Radius ─────────────────────────────────────────────
      borderRadius: {
        sm:   '8px',
        md:   '12px',
        lg:   '16px',
        xl:   '20px',
        '2xl':'24px',
        '3xl':'32px',
      },

      // ── Box Shadow ────────────────────────────────────────────────
      boxShadow: {
        'card':        'var(--shadow-card)',
        'card-hover':  'var(--shadow-card-hover)',
        'modal':       'var(--shadow-modal)',
        'glow-brand':  '0 0 20px rgba(59,130,246,0.35)',
        'glow-cyan':   '0 0 20px rgba(6,182,212,0.35)',
        'glow-success':'0 0 16px rgba(16,185,129,0.3)',
        'inset-light': 'inset 0 1px 0 rgba(255,255,255,0.06)',
      },

      // ── Background Images / Gradients ─────────────────────────────
      backgroundImage: {
        'gradient-brand':  'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
        'gradient-hot':    'linear-gradient(135deg, #f43f5e 0%, #f97316 100%)',
        'gradient-success':'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'gradient-purple': 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
      },

      // ── Sidebar widths ────────────────────────────────────────────
      width: {
        sidebar:    '260px',
        'sidebar-c': '72px',
      },

      // ── Animations ────────────────────────────────────────────────
      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-700px 0' },
          '100%': { backgroundPosition: '700px 0' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in-up':     'fadeInUp 0.4s cubic-bezier(0.4,0,0.2,1) both',
        'fade-in':        'fadeIn 0.3s ease both',
        'shimmer':        'shimmer 1.6s linear infinite',
        'scale-in':       'scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.4,0,0.2,1) both',
      },

      // ── Transition ────────────────────────────────────────────────
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34,1.56,0.64,1)',
        smooth: 'cubic-bezier(0.4,0,0.2,1)',
      },
    },
  },

  plugins: [],
};