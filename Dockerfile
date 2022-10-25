# Build stage
FROM node:16.13.2 as builder
ARG ENV=production
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

# stage 2 - build the final image and copy the react build files
FROM nginx:1.21.6-alpine
COPY --from=builder /app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY --from=builder /app/.env.example /usr/share/nginx/html/.env
COPY nginx/nginx.conf /etc/nginx/conf.d

RUN apk add --update nodejs
RUN apk add --update npm
RUN npm install -g runtime-env-cra@0.2.2

WORKDIR /usr/share/nginx/html

EXPOSE 80
CMD ["/bin/sh", "-c", "runtime-env-cra && nginx -g \"daemon off;\""]
