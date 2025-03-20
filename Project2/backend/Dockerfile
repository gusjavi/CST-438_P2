FROM eclipse-temurin:17-jdk

LABEL authors="Eric Rios"

WORKDIR /app

COPY target/*.jar app.jar

EXPOSE 8080

# Run the Spring Boot app
ENTRYPOINT ["java", "-jar", "app.jar"]