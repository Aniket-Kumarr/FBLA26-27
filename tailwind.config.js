// "Queen City Morning" theme: black / white / gray (and the light accent shades) are CSS
// variables, defined in app/globals.css. On the light page "black" is warm cream and "white" is
// navy ink; inside `.theme-night` (hero, GPS map, closing call to action, footer) they switch
// back to the original dark values. Existing classes keep working, including /opacity modifiers.
const v = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;
const scale = (name, steps) => Object.fromEntries(steps.map((s) => [s, v(`${name}-${s}`)]));

const config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './lib/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                black: v('black'),
                white: v('white'),
                gray: scale('gray', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]),
                teal: scale('teal', [200, 300, 400]),
                indigo: scale('indigo', [200, 300, 400]),
                rose: scale('rose', [200, 300, 400]),
                amber: scale('amber', [200, 300]),
                yellow: scale('yellow', [400]),
            },
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
                sway: {
                    '0%, 100%': { transform: 'rotate(-4deg)' },
                    '50%': { transform: 'rotate(4deg)' },
                },
                firefly: {
                    '0%, 100%': { transform: 'translate(0, 0)', opacity: '0.3' },
                    '25%': { transform: 'translate(6px, -10px)', opacity: '0.9' },
                    '50%': { transform: 'translate(-4px, -4px)', opacity: '0.5' },
                    '75%': { transform: 'translate(-8px, -14px)', opacity: '0.9' },
                },
                'pulse-ring': {
                    '0%': { transform: 'scale(0.9)', opacity: '0.7' },
                    '100%': { transform: 'scale(1.6)', opacity: '0' },
                },
                // droplet floats in a small arc and wobbles like liquid (squash & stretch)
                'droplet-bob': {
                    '0%, 100%': { transform: 'translate(0, 0) scale(1, 1)' },
                    '25%': { transform: 'translate(4px, -10px) scale(1.035, 0.965)' },
                    '50%': { transform: 'translate(0, -16px) scale(1, 1)' },
                    '75%': { transform: 'translate(-4px, -8px) scale(0.965, 1.035)' },
                },
            },
            animation: {
                marquee: 'marquee 50s linear infinite',
                drift: 'drift 18s ease-in-out infinite',
                'drift-slow': 'drift-slow 24s ease-in-out infinite',
                float: 'float 6s ease-in-out infinite',
                'ping-soft': 'ping-soft 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                sway: 'sway 4s ease-in-out infinite',
                firefly: 'firefly 7s ease-in-out infinite',
                'pulse-ring': 'pulse-ring 2.2s cubic-bezier(0, 0, 0.2, 1) infinite',
                'droplet-bob': 'droplet-bob 7s ease-in-out infinite',
            },
        },
    },
    plugins: [],
}
export default config
