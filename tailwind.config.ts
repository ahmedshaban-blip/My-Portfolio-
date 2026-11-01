import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
			border: 'oklch(var(--border) / <alpha-value>)',
			input: 'oklch(var(--input) / <alpha-value>)',
			ring: 'oklch(var(--ring) / <alpha-value>)',
			background: 'oklch(var(--background) / <alpha-value>)',
			foreground: 'oklch(var(--foreground) / <alpha-value>)',
			primary: {
				DEFAULT: 'oklch(var(--primary) / <alpha-value>)',
				foreground: 'oklch(var(--primary-foreground) / <alpha-value>)',
				glow: 'oklch(var(--primary-glow) / <alpha-value>)'
			},
			secondary: {
				DEFAULT: 'oklch(var(--secondary) / <alpha-value>)',
				foreground: 'oklch(var(--secondary-foreground) / <alpha-value>)'
			},
			destructive: {
				DEFAULT: 'oklch(var(--destructive) / <alpha-value>)',
				foreground: 'oklch(var(--destructive-foreground) / <alpha-value>)'
			},
			muted: {
				DEFAULT: 'oklch(var(--muted) / <alpha-value>)',
				foreground: 'oklch(var(--muted-foreground) / <alpha-value>)'
			},
			accent: {
				DEFAULT: 'oklch(var(--accent) / <alpha-value>)',
				foreground: 'oklch(var(--accent-foreground) / <alpha-value>)',
				glow: 'oklch(var(--accent-glow) / <alpha-value>)'
			},
			popover: {
				DEFAULT: 'oklch(var(--popover) / <alpha-value>)',
				foreground: 'oklch(var(--popover-foreground) / <alpha-value>)'
			},
			card: {
				DEFAULT: 'oklch(var(--card) / <alpha-value>)',
				foreground: 'oklch(var(--card-foreground) / <alpha-value>)'
  			},
			sidebar: {
				DEFAULT: 'oklch(var(--sidebar-background) / <alpha-value>)',
				foreground: 'oklch(var(--sidebar-foreground) / <alpha-value>)',
				primary: 'oklch(var(--sidebar-primary) / <alpha-value>)',
				'primary-foreground': 'oklch(var(--sidebar-primary-foreground) / <alpha-value>)',
				accent: 'oklch(var(--sidebar-accent) / <alpha-value>)',
				'accent-foreground': 'oklch(var(--sidebar-accent-foreground) / <alpha-value>)',
				border: 'oklch(var(--sidebar-border) / <alpha-value>)',
				ring: 'oklch(var(--sidebar-ring) / <alpha-value>)'
			},
			success: 'oklch(var(--success) / <alpha-value>)',
			warning: 'oklch(var(--warning) / <alpha-value>)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
		// PERF: a theme switch flips ~20 CSS vars on <html> at once. `transition-all`
		// also animates filter/backdrop-filter, which forces the browser to re-rasterize
		// every blurred glass layer on each animation frame. Stick to paint-only props.
		transitionProperty: {
			colors: 'color, background-color, border-color, text-decoration-color, fill, stroke',
			interaction: 'color, background-color, border-color, box-shadow, transform, opacity'
		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		fontFamily: {
  			sans: [
  				'Plus Jakarta Sans',
  				'Inter',
  				'ui-sans-serif',
  				'system-ui',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI',
  				'Roboto',
  				'Helvetica Neue',
  				'Arial',
  				'Noto Sans',
  				'sans-serif'
  			],
  			serif: [
  				'Lora',
  				'ui-serif',
  				'Georgia',
  				'Cambria',
  				'Times New Roman',
  				'Times',
  				'serif'
  			],
  			mono: [
  				'JetBrains Mono',
  				'Fira Code',
  				'ui-monospace',
  				'SFMono-Regular',
  				'Menlo',
  				'Monaco',
  				'Consolas',
  				'Liberation Mono',
  				'Courier New',
  				'monospace'
  			]
  		}
  	}
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
