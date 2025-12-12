# Deployment Guide (local dev and CI)

This project contains a frontend (Vite) and a backend (Spring Boot + MongoDB). This guide explains how to run locally with Docker and how to build images in CI.

## Local development with Docker

1. Create a `.env` file at the repo root (do NOT commit) with required secrets, for example:

```
JWT_SECRET=changeme
JWT_EXPIRATION=3600000
JWT_REFRESH_EXPIRATION=86400000
STRIPE_SECRET_KEY=sk_test_...
FRONTEND_SUCCESS_URL=http://localhost:5173
FRONTEND_CANCEL_URL=http://localhost:5173/cart
EMAIL_USERNAME=example@gmail.com
EMAIL_PASSWORD=password
FRONTEND_ALLOWED_ORIGINS=http://localhost:5173
```

2. Start services with docker-compose (dev file includes frontend, backend, mongodb):

```powershell
cd "C:\Users\wlock\OneDrive\Documents\Runtime-Rebels-Project-1.2"
docker compose -f docker-compose.dev.yml up --build
```

- Backend will be available at http://localhost:8080
- Frontend will be available at http://localhost:5173
- MongoDB will be available at mongodb://rootuser:rootpass@localhost:27017

## CI: GitHub Actions

- The workflow `.github/workflows/docker-build.yml` will build both backend and frontend images on push to `main/master`.
- To push images to GHCR, add repository secret `GHCR_PAT` with a personal access token that has `write:packages` (and `read:packages`).

## Deploying images

You can push images to any registry and deploy to your chosen provider:

- Render / Railway: connect repository and add the built images or use Dockerfile directly.
- DigitalOcean App Platform: push to registry and configure apps.
- Kubernetes: deploy images and set secrets for env vars.

## Security
- Do not commit `.env` or any plaintext credentials.
- Use provider secret management for production keys.
- Ensure `FRONTEND_ALLOWED_ORIGINS` is set to your exact frontend domain in production.

## Notes
- The backend Dockerfile builds using Maven and copies the produced JAR into a small JRE image.
- The frontend Dockerfile performs an npm build and serves static files with `nginx`.

If you want, I can also prepare Helm manifests, a Render or Railway `app.yaml` for zero-config deploy, or add a GitHub Actions job to push artifacts to Docker Hub instead of GHCR.

