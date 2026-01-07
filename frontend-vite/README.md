# Scamazon Frontend API Docs

Welcome to landing page for our generated documentation!

## Getting Started
1. Install: `npm install`
2. Make sure backend is up and running or else no products will load when starting the frontend!
3. Run: `npm run dev`

## Backend API (localhost vs deployed)
This app reads the backend base URL from `VITE_API_BASE_URL`.

- Dev (`npm run dev`) uses [frontend-vite/.env.development](frontend-vite/.env.development) (defaults to `http://localhost:8080/api`).
- Prod build (`npm run build` / `npm run deploy`) uses [frontend-vite/.env.production](frontend-vite/.env.production) (defaults to Render).

You can also override temporarily:
- `VITE_API_BASE_URL=http://localhost:8080/api npm run dev`
- `VITE_API_BASE_URL=https://scamazon-backend.onrender.com/api npm run build`

## Architecture Overview
This project is for our COMP 380 class. Team members include Frank Gonzalez, Haley Kenney, Henry Locke, and Alexander Nima.

You will find that documentation is `frontend-vite/docs/index.html`. Components can be found in `frontend-vite/src/components`. Pages will be found in `frontend-vite/src/pages`. Lastly, App.jsx sets routes for the entire frontend.

This project is largely designed with daisyUI components which is why much of the syntax may not be what you are used to. The purpose of using daisyUI is so that the amount of lines is reduced, while also providing many reusable components with unique designs and theming.