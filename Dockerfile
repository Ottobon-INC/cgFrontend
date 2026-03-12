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

# Stage 2: Serve compiled code statically with Node
FROM node:20-alpine

WORKDIR /app

# Install static file server
RUN npm install -g serve

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3500

# Run serve on port 3500
CMD ["serve", "-s", "dist", "-l", "3500"]
