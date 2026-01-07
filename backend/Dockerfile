FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

COPY target/spring-boot-0.0.1-SNAPSHOT.jar backend.jar

EXPOSE 8080

CMD [ "java", "-jar", "backend.jar" ]