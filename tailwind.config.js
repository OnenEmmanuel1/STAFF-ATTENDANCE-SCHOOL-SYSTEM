/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./views/**/*.{html,js}", "./public/**/*.{html,js}"],
    theme: {
        extend: {
            colors: {
                attendance: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                },
                primary: {
                    DEFAULT: '#4F46E5', // Indigo 600
                    hover: '#4338ca',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
