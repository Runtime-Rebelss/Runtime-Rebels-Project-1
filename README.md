# Runtime-Rebels-Project-1
Ecommerce website project

## Environment and local setup

The project has a backend (Spring Boot / Maven) in `./backend` and a frontend (Vite / React) in `./frontend-vite`.

Before running the app locally, create a `.env` file or configure environment variables. See `.env.example` for placeholders.

Important environment variables (examples):

- MONGO_URI or set `spring.data.mongodb.uri` to your MongoDB connection string
- APPLICATION_SECURITY_JWT_SECRET_KEY - JWT signing secret
- STRIPE_SECRET_KEY - Stripe secret (server-side only)
- VITE_STRIPE_PUBLISHABLE_KEY - Stripe publishable key for frontend
- MAIL_USERNAME, MAIL_PASSWORD, MAIL_HOST, MAIL_PORT - SMTP settings for sending emails

Quick start (PowerShell):

1. Start the backend (from project root):

   Set-Location -Path .\backend; .\mvnw.cmd spring-boot:run

2. Start the frontend (from project root):

   Set-Location -Path .\frontend-vite; npm ci; npm run dev

See `CONTRIBUTING.md` for how to run tests and contribute.
