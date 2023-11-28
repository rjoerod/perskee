/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                main: 'rgb(13, 17, 23)',
                side: 'rgb(22, 27, 34)',
                outline: 'rgb(33, 38, 45)',
                words: 'rgb(230, 237, 243)',
            },
        },
    },
    plugins: [require('@tailwindcss/typography')],
}
