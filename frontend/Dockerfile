FROM node:24 AS build
ARG AIM
WORKDIR /src
ENV DIR node_modules
RUN npm set registry http://localhost:4873/

RUN apt update -y && apt-get install -y iputils-ping dnsutils net-tools
RUN curl http://localhost:4873

COPY tsconfig.json package.json package-lock.json angular.json ./
RUN npm install --loglevel=info

COPY ./projects ./projects
RUN npm run build:$AIM --loglevel=info


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