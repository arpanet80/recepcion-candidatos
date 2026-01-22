# Stage 1: Build the Angular application
FROM node:slim as builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build the application
COPY . .
RUN npm run build --configuration=production

# Stage 2: Create a minimal image to serve the application
FROM nginx:alpine-slim

# Copy the built application
COPY --from=builder /app/dist/candidatos-ui/browser /usr/share/nginx/html

# Copy the nginx configuration
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Command to replace environment variables and start nginx
CMD ["/bin/sh", "-c", "envsubst < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js && exec nginx -g 'daemon off;'"]


