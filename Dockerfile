# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Accept build arguments for environment variables passed by docker-compose
ARG VITE_API_URL
ARG NEXT_PUBLIC_API_URL

# Set them as ENV during build so Vite can embed them into the static files
ENV VITE_API_URL=$VITE_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package*.json ./

RUN npm install

# Copy complete source code
COPY . .

# Build the Vite application (outputs to /app/dist)
RUN npm run build

# Stage 2: Serve compiled code statically with Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace default nginx configuration with our SPA (Single Page App) valid configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
