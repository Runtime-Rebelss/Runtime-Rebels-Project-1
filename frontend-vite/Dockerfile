# Frontend build + serve using nginx
FROM node:18 AS build
WORKDIR /app
COPY package.json package-lock.json* ./
COPY . .
RUN npm ci
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Copy a minimal nginx conf if you want custom routes (optional)
EXPOSE 80
CMD ["/bin/sh", "-c", "nginx -g 'daemon off;'"]

