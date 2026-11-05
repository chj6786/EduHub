plugins {
    java
    id("org.springframework.boot") version "2.7.18"
    id("io.spring.dependency-management") version "1.0.15.RELEASE"
    // 6.13.0이 JRE 8에서 동작하는 마지막 버전이다 (6.14.0부터 JRE 11 이상).
    id("com.diffplug.spotless") version "6.13.0"
}

group = "com.example"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(8)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.flywaydb:flyway-core")
    implementation("org.springdoc:springdoc-openapi-ui:1.8.0")
    runtimeOnly("org.postgresql:postgresql")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

// Java 8은 기본 인코딩이 OS를 따른다(Windows 한국어: MS949). 한글 주석·문자열이 깨지지 않게 UTF-8로 고정한다.
tasks.withType<JavaCompile> {
    options.encoding = "UTF-8"
}

tasks.withType<Test> {
    useJUnitPlatform()
    systemProperty("spring.profiles.active", "test")
    jvmArgs("-Dfile.encoding=UTF-8")
}

// NFR-05: 포맷 검사. `./gradlew spotlessApply`로 자동 정리한다.
spotless {
    java {
        // 1.7이 Java 8에서 실행되는 마지막 google-java-format 버전이다.
        googleJavaFormat("1.7")
        removeUnusedImports()
        trimTrailingWhitespace()
        endWithNewline()
    }
    kotlinGradle {
        target("*.gradle.kts")
        ktlint()
    }
}
