import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
    // GitHub Pages project site base URL: https://<user>.github.io/Runtime-Rebels-Project-1/
    // Keep dev server working at '/', but build for the Pages sub-path.
    base: '/Runtime-Rebels-Project-1/',
    plugins: [
        react(),
        tailwindcss()
    ],
}))