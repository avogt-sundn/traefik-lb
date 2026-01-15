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
COPY --from=build /src/dist/$AIM/browser  /usr/share/nginx/html

# Minimal SPA fallback directly in Dockerfile
RUN echo 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}' > /etc/nginx/conf.d/default.conf