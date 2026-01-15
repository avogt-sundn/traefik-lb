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
