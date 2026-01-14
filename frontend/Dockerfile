FROM node:24 AS build
WORKDIR /src
COPY package.json ./
RUN npm install
COPY . ./
RUN npm run build

FROM nginx:stable AS runtime
EXPOSE 80
ARG AIM
COPY --from=build src/dist/$AIM  /usr/share/nginx/html
