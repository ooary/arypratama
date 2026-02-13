/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                dark: {
                    900: '#18181b',
                    800: '#27272a',
                    700: '#3f3f46',
                    text: '#e4e4e7',
                    muted: '#a1a1aa',
                },
                light: {
                    bg: '#F8F9FA',
                    text: '#1a1a1a',
                    muted: '#6b7280',
                },
            },
            fontFamily: {
                sans: ['"Space Mono"', 'monospace'],
                mono: ['"Space Mono"', 'monospace'],
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
};
