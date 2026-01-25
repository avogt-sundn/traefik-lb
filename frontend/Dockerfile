FROM node:24 AS build
ARG AIM
WORKDIR /src
COPY tsconfig.json package.json package-lock.json angular.json ./
RUN npm install
COPY ./projects ./projects
RUN npm run build:$AIM

FROM nginx:stable AS runtime
EXPOSE 80
ARG AIM

# Copy Angular build output
COPY --from=build /src/dist/$AIM/browser /usr/share/nginx/html

# Override nginx.conf: enable MIME types + SPA fallback
RUN cat > /etc/nginx/nginx.conf <<EOF
worker_processes 1;

events {
  worker_connections 1024;
}

http {
  include       /etc/nginx/mime.types;
  default_type  application/octet-stream;

  server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
      try_files \$uri \$uri/ /index.html;
    }
  }
}
EOF