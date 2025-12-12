# Backend multi-stage Dockerfile
# Build stage
FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /workspace

# Copy maven files first for better caching
COPY pom.xml mvnw ./
# If .mvn exists, copy it (some repos include the wrapper)
COPY .mvn .mvn

# Copy source and build
COPY src ./src

# Use -DskipTests to speed up builds in CI; adjust as needed
RUN mvn -B -DskipTests package

# Run stage
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy the built jar (assumes single jar in target)
COPY --from=build /workspace/target/*.jar ./app.jar

EXPOSE 8080
ENV JAVA_OPTS="-Xms256m -Xmx512m"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]

