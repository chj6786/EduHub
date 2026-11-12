---
name: eduhub-api
description: EduHub 백엔드에 REST API를 추가하거나 바꿀 때 쓰는 절차. 컨트롤러·서비스·DTO·예외 매핑·OpenAPI·테스트를 기존 패턴대로 만들고, 프론트 클라이언트 재생성까지 확인한다.
argument-hint: "[요구사항 ID 또는 API 설명]"
---

# EduHub API 추가 절차

대상: $ARGUMENTS

규칙의 근거는 `backend/CLAUDE.md`와 `docs/requirements.md`다. 이 절차는 그 규칙을 순서대로 적용하는 방법만 담는다.

## 1. 위치 정하기

- 도메인 패키지(`course`, `enrollment`)를 고른다. `common`은 도메인을 참조하지 않고, `course`는 `enrollment`를 참조하지 않는다.
- 패키지 안의 계층:
  - `domain`: 엔티티와 리포지토리
  - `application`: 서비스와 요청·응답 DTO
  - `api`: 컨트롤러
- 조회는 `XxxQueryService`(`@Transactional(readOnly = true)`), 변경은 `XxxCommandService`(`@Transactional`)에 둔다.

## 2. 구현

1. **스키마**: 바뀌면 `backend/src/main/resources/db/migration/V{다음 번호}__설명.sql`을 새로 추가한다. 이미 적용된 파일은 고치지 않는다.
2. **엔티티**:
   - setter는 만들지 않는다. 상태는 도메인 메서드(`close()`, `update(...)`)로만 바꾼다.
   - 연관관계는 LAZY로 둔다.
3. **DTO**:
   - Java 8이라 record를 쓰지 않는다. 불변 클래스와 getter로 만든다.
   - 요청 DTO에는 `javax.validation` 어노테이션을 붙인다.
4. **서비스**:
   - 없는 대상은 `NotFoundException`(404)을 던진다.
   - 상태 충돌은 `ConflictException`(409)을 던진다.
   - 정원·수량을 바꾸는 경로는 회차 행 비관적 락 안에서 처리한다(NFR-01).
5. **컨트롤러**:
   - `/api/v1/...` 경로를 쓰고 `@Tag`, `@Operation`을 단다.
   - 오류 응답은 `@ApiResponse`에 `ErrorResponse` 스키마로 적는다.
   - 엔티티를 직접 반환하지 않는다.
6. 코드 주석에 요구사항 ID(FR-xx, NFR-xx)를 남긴다.

## 3. 테스트

- 컨트롤러: `@WebMvcTest` + `@MockBean`. 정상, 400, 404, 409를 확인한다.
- 서비스와 리포지토리: `eduhub_test` DB를 쓰는 `@DataJpaTest` 또는 `@SpringBootTest`.

## 4. 검증 (모두 `backend/`에서 실행)

```bash
./gradlew spotlessApply
./gradlew test
```

Windows PowerShell에서는 `.\gradlew.bat spotlessApply`, `.\gradlew.bat test`를 쓴다.

## 5. 프론트 클라이언트 (API 계약이 바뀐 경우, NFR-04)

백엔드를 8080에 띄운 뒤 `frontend/`에서 클라이언트를 다시 생성한다. 생성된 `packages/api-client/src/generated`는 손으로 고치지 않는다.

```bash
npm run generate:api
npm test -w apps/course-mfe
```

## 완료 보고

다음을 짧게 보고한다:

- 바뀐 파일 목록
- 추가한 API(메서드, 경로, 상태 코드)
- 테스트 결과
