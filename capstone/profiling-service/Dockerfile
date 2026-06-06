FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app

# 의존성 캐싱을 위해 빌드 스크립트 먼저 복사
COPY gradlew settings.gradle build.gradle ./
COPY gradle gradle/
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon -q

COPY src src/
RUN ./gradlew bootJar --no-daemon -x test -q

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
