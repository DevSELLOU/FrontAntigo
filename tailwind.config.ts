import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: 'var(--font-sans)'
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'var(--text)',
        brand: {
          '50': 'var(--brand-050)',
          '100': 'var(--brand-100)',
          '500': 'var(--brand-500)',
          '600': 'var(--brand-600)',
          '700': 'var(--brand-700)',
          '800': 'var(--brand-800)'
        },
        // Named 'app' (not 'bg-app') on purpose: Tailwind prefixes color keys with the
        // utility name, so a key literally called 'bg-app' generates the class `bg-bg-app`,
        // not `bg-app`. Every screen using `className='bg-app'` (Dashboard×2, Products, Users,
        // Orders, AuthTemplate...) was silently getting zero background rule — confirmed by
        // grepping the compiled CSS for `.bg-app{`/`.bg-bg-app{`, neither existed. `bg-sidebar`
        // is left alone: `side-bar.tsx` already works around the same bug by writing the class
        // as `bg-bg-sidebar`, so renaming that key would break the one place that already
        // adapted to it.
        app: 'var(--bg-app)',
        'bg-sidebar': 'var(--bg-sidebar)',
        surface: {
          DEFAULT: 'var(--surface)',
          muted: 'var(--surface-muted)'
        },
        text: {
          DEFAULT: 'var(--text)',
          body: 'var(--text-body)',
          muted: 'var(--text-muted)',
          inverse: 'var(--text-inverse)'
        },
        green: {
          '50': '#f0fdf1',
          '100': '#dbfdde',
          '200': '#baf8c0',
          '300': '#84f18e',
          '400': '#35de46',
          '500': '#1fc830',
          '600': '#13a622',
          '700': '#13821f',
          '800': '#14671e',
          '900': '#13541c',
          '950': '#042f0b'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'var(--custom-color, var(--action))',
          foreground: 'var(--custom-text-color, #f8f7eb)'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)'
        },
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        },
        success: {
          DEFAULT: 'var(--success-bg)',
          border: 'var(--success-bd)',
          foreground: 'var(--success-fg)'
        },
        warning: {
          DEFAULT: 'var(--warning-bg)',
          border: 'var(--warning-bd)',
          foreground: 'var(--warning-fg)'
        },
        danger: {
          DEFAULT: 'var(--danger-bg)',
          border: 'var(--danger-bd)',
          foreground: 'var(--danger-fg)'
        },
        info: {
          DEFAULT: 'var(--info-bg)',
          border: 'var(--info-bd)',
          foreground: 'var(--info-fg)'
        }
      },
      borderRadius: {
        lg: 'var(--r-lg)',
        md: 'var(--r-md)',
        sm: 'var(--r-sm)',
        full: 'var(--r-full)'
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        pop: 'var(--shadow-pop)'
      },
      fontSize: {
        'display': ['40px', { lineHeight: '1.15', fontWeight: '700' }],
        'h1': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['24px', { lineHeight: '1.3', fontWeight: '700' }],
        'h3': ['17px', { lineHeight: '1.4', fontWeight: '600' }],
        'metric': ['34px', { lineHeight: '1.1', fontWeight: '700' }],
        'metric-frac': ['20px', { lineHeight: '1.1', fontWeight: '700' }],
        'body': ['15px', { lineHeight: '1.5', fontWeight: '400' }],
        'label': ['14px', { lineHeight: '1.4', fontWeight: '600' }],
        'caption': ['13px', { lineHeight: '1.4', fontWeight: '400' }],
        'eyebrow': ['11px', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '0.08em' }]
      }
    }
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')]
}
export default config
