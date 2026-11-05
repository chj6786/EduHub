# backend/CLAUDE.md

## 기술 제약 (버전 고정 이유가 있음)

- **Java 8 + Spring Boot 2.7.** Java 11+ 문법(`var`, `List.of`, record, text block 등)을 쓰지 않는다. `javax.*` 패키지를 쓴다(`jakarta.*` 아님).
- JRE 8 호환 때문에 Spotless 6.13.0, google-java-format 1.7로 고정되어 있다. 올리지 않는다.
- 소스·테스트·Gradle 데몬 모두 UTF-8로 강제되어 있다(Windows 기본 MS949 대응). 한글 주석/문자열이 일반적이다.

## 테스트·빌드 명령

모든 Gradle 명령은 `backend/`에서 실행한다. `application.yml`이 `../.env`를 상대 경로로 읽기 때문에 다른 위치에서 실행하면 DB 접속 정보가 비어 기동이 실패한다.

```bash
./gradlew build                 # 컴파일 + 테스트 + spotlessCheck
./gradlew test                  # 전체 테스트 (test 프로필로 실행됨)
./gradlew test --tests "com.example.eduhub.common.api.HealthControllerTest"   # 단일 클래스
./gradlew test --tests "*HealthControllerTest.health_returnsUp"               # 단일 메서드
./gradlew spotlessApply         # 포맷 자동 정리 (커밋 전에 실행)
./gradlew spotlessCheck         # 포맷 검사만
./gradlew bootRun               # 로컬 실행 (기본 dev 프로필)
```

실행 후: Swagger UI `http://localhost:8080/swagger-ui.html`, 스펙 `/v3/api-docs`, 헬스체크 `/api/health`.

## 설정과 프로필

- `application.yml`이 공통이다. 기본 프로필은 `dev`, 테스트는 `build.gradle.kts`에서 `test` 프로필을 강제한다.
- 접속 정보는 기본값 없이 환경 변수로만 받는다(루트 `.env`). dev: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`(`eduhub` DB) / test: `TEST_DB_URL`, `TEST_DB_USERNAME`, `TEST_DB_PASSWORD`(`eduhub_test` DB)
- `@WebMvcTest` 같은 슬라이스 테스트는 DB 없이 돈다. `@SpringBootTest`/`@DataJpaTest`는 `eduhub_test` DB가 필요하다.

## 아키텍처와 계층 규칙

루트 패키지 `com.example.eduhub` 아래 도메인별 패키지로 나눈다(NFR-07). 의존 방향 규칙은 각 `package-info.java`에 적혀 있다.

- `common`: 설정(`config`), 공통 엔드포인트(`api`), 에러 처리. **도메인 패키지를 참조하지 않는다.**
- `course`: 과정·회차(목록·검색, 상세, 관리자 등록·수정·종료). **`enrollment`를 참조하지 않는다.**
- `enrollment`: 신청, 대기 순번, 취소와 대기자 승급, 수료. `course`를 참조할 수 있다(단방향).
- 계층은 Controller → Service → Repository. Controller에서 Repository를 직접 호출하지 않는다.
- 핵심 난제는 정원 정합성이다(NFR-01): 동시에 100명이 마지막 1자리에 신청해도 정원을 넘으면 안 된다. 신청/취소/승급은 락 또는 조건부 업데이트로 보호하고 동시성 테스트로 검증한다.

## JPA 규칙

- 연관관계는 LAZY로 둔다.
- 엔티티를 API 응답으로 그대로 반환하지 않는다. DTO로 바꿔 반환한다.
- `open-in-view: false`: 지연 로딩은 서비스 트랜잭션 안에서 끝낸다(컨트롤러에서 지연 연관을 건드리면 예외가 난다). 목록 조회는 fetch join/EntityGraph 등으로 N+1을 피한다(NFR-02). dev 프로필은 SQL과 바인딩 값을 로그로 출력한다.
- 스키마는 **Flyway 마이그레이션으로만** 바꾼다(`ddl-auto: validate`). `src/main/resources/db/migration`에 `V{n}__설명.sql`로 추가하고, 적용된 마이그레이션 파일은 수정하지 않는다.

## OpenAPI 규칙

- 모든 API는 OpenAPI 문서를 갖는다(`@Tag`, `@Operation`). 프론트 클라이언트는 이 스펙에서 생성한다(NFR-04).
