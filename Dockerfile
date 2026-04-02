# Build VitePress static files
FROM node:22-alpine AS builder
WORKDIR /app

# Install git for lastUpdated feature
RUN apk add --no-cache git

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run docs:build

# Serve via lightweight Nginx
FROM nginx:1.27-alpine

# Copy custom nginx configuration to handle cleanUrls
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Serve files directly in the /docs sub-directory to match the router's base and Traefik's PathPrefix
COPY --from=builder /app/docs/.vitepress/dist /usr/share/nginx/html/docs

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
