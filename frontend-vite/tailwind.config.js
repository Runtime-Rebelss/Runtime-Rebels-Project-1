/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui"
import flowbite from "flowbite/plugin";

export default {
    content: ["./src/**/*.{html,js, jsx, ts, tsx}", "./index.html", ],
    theme: {
        extend: {},
    },
    plugins: [
        daisyui,

    ],
    daisyui: {
        themes: [],
},
}