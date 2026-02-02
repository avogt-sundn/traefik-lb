# Stage 1: Build the application using Maven
FROM maven:3.9.8-eclipse-temurin-21 AS build

WORKDIR /code
ENV DIR /root/.m2/repository
COPY  --chmod=0755 mvnw /code/mvnw
COPY  .mvn /code/.mvn
COPY pom.xml /code/

RUN --mount=type=cache,target=$DIR mkdir -p $DIR && echo "cached .m2 size: " $(du -sh $DIR)
RUN --mount=type=cache,target=$DIR ./mvnw -B org.apache.maven.plugins:maven-dependency-plugin:3.8.1:go-offline

COPY src ./src
RUN --mount=type=cache,target=$DIR ./mvnw -B package -DskipTests


# Stage 2: Run the application with a lightweight JRE
FROM eclipse-temurin:21-jre-alpine

# for healthcheck is using curl
RUN apk update && apk add curl && apk upgrade

WORKDIR /app

# Copy the built JAR from the previous stage
COPY --from=build /code/target/*.jar app.jar

# Expose application port (adjust if your app uses a different one)
EXPOSE 443

# Run the application on port 443 (HTTPS)
ENTRYPOINT ["java", "-Dquarkus.http.ssl-port=443", "-jar", "/app/app.jar"]