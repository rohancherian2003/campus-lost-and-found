# Build stage
FROM maven:3.8.8-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre
WORKDIR /app

# Create non-privileged user for security hardening
RUN groupadd -r campus && useradd -r -g campus campususer

COPY --from=build /app/target/campus-lost-found-backend-1.0.0.jar ./app.jar

# Ensure the app user owns the working directory
RUN chown -R campususer:campus /app

ENV HTTP_PORT=8080
ENV MONGO_URI=mongodb://mongodb:27017
ENV MONGO_DATABASE=campus_lost_found
ENV CORS_ORIGIN=http://localhost:4200

EXPOSE 8080

# Switch to non-privileged user (prevents container breakout as root)
USER campususer

# The container expects JWT_SECRET to be passed in at runtime
ENTRYPOINT ["java", "-jar", "app.jar"]
