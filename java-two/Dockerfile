# Stage 1: Build the application using Maven
FROM maven:3.9.8-eclipse-temurin-21 AS build
WORKDIR /app

# Copy Maven project files
COPY pom.xml .
RUN mvn -B compile

COPY src ./src
# Build the project and skip tests for speed
RUN mvn -B package -DskipTests


# Stage 2: Run the application with a lightweight JRE
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built JAR from the previous stage
COPY --from=build /app/target/*.jar app.jar

# Expose application port (adjust if your app uses a different one)
EXPOSE 8080

RUN apk update && apk add curl && apk upgrade
# Run the application
ENTRYPOINT ["java", "-jar", "/app/app.jar"]