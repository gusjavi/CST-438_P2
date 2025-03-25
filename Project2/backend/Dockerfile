FROM eclipse-temurin:17-jdk

LABEL authors="Eric Rios"

WORKDIR /app

# Copy built JAR and firebase-service-account.json into the image
COPY target/*.jar app.jar
COPY src/main/resources/firebase-service-account.json firebase-service-account.json

EXPOSE 8080

# Run the Spring Boot app
ENTRYPOINT ["java", "-jar", "app.jar"]