# ---------- Build Stage ----------
    FROM maven:3.9.6-eclipse-temurin-17 AS builder

    WORKDIR /build
    
    # Copy Maven wrapper and make it executable
    COPY .mvn/ .mvn
    COPY mvnw ./
    RUN chmod +x mvnw
    
    # Copy pom.xml and download dependencies (leverage caching)
    COPY pom.xml ./
    RUN ./mvnw dependency:go-offline -B
    
    # Copy the rest of the source and build the application
    COPY src/ src/
    RUN ./mvnw clean package -DskipTests -B
    
    # ---------- Runtime Stage ----------
    FROM eclipse-temurin:17-jdk-alpine
    
    WORKDIR /app
    
    # Copy the built JAR file from the builder image
    COPY --from=builder /build/target/*.jar app.jar
    
    # Expose the port (Render will bind to it)
    EXPOSE 8080
    
    # Tell the container to run your Spring Boot app
    ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT}"]
