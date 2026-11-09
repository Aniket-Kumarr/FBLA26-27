import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './lib/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            keyframes: {
                marquee: {
                    from: { transform: 'translateX(0)' },
                    to: { transform: 'translateX(-50%)' },
                },
                drift: {
                    '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
                    '50%': { transform: 'translate3d(6rem, 4rem, 0) scale(1.15)' },
                },
                'drift-slow': {
                    '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
                    '50%': { transform: 'translate3d(-5rem, -3rem, 0) scale(1.1)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'ping-soft': {
                    '0%': { transform: 'scale(1)', opacity: '0.8' },
                    '80%, 100%': { transform: 'scale(2.4)', opacity: '0' },
                },
            },
            animation: {
                marquee: 'marquee 50s linear infinite',
                drift: 'drift 18s ease-in-out infinite',
                'drift-slow': 'drift-slow 24s ease-in-out infinite',
                float: 'float 6s ease-in-out infinite',
                'ping-soft': 'ping-soft 2s cubic-bezier(0, 0, 0.2, 1) infinite',
            },
        },
    },
    plugins: [],
}
export default config
