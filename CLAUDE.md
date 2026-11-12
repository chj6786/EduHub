# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트

EduHub: 사내 교육과정 조회·수강 신청 시스템. 정원이 차면 대기자로 등록되고, 취소 시 대기 1순위가 자동 확정된다.
요구사항(FR-xx, NFR-xx, 결정 사항 D-xx)과 주차별 범위는 `docs/requirements.md`가 기준이다. 코드 주석에 해당 요구사항 ID를 달아 근거를 남긴다.

## 디렉터리 지도

- `backend/`: Spring Boot API (Java 8, Spring Boot 2.7). 규칙은 `backend/CLAUDE.md`
- `frontend/`: React 18 + TypeScript, Module Federation(shell / course-mfe / enrollment-mfe), MUI, Axios, npm workspaces. 아직 코드는 없다. 규칙은 `frontend/CLAUDE.md`
- `docs/`: 요구사항 문서 `docs/requirements.md`, 설계 명세 `docs/design/`, 구현 계획 `docs/plans/`
- `.env.example`: 환경 변수 이름 목록. 실제 값은 저장소 루트 `.env`에 둔다

## 실행 명령

모든 Gradle 명령은 `backend/`에서 실행한다. 전체 명령은 `backend/CLAUDE.md`에 있다. 프론트엔드 명령은 아직 없다.

```bash
cd backend && ./gradlew test      # 백엔드 빌드·테스트
cd backend && ./gradlew bootRun   # 로컬 실행 (dev 프로필)
```

## 공통 규칙

- 커밋 메시지는 Conventional Commits 형식을 따른다. 예: `feat(backend): Spring Boot 뼈대와 헬스체크 API 추가`, `docs: 요구사항 문서 추가`
- `main`에 직접 커밋하지 않는다. `타입/설명` 브랜치(예: `feature/week1-skeleton`, `chore/claude-md-split`)에서 작업하고 `main`에 병합한다.
- 비밀 정보는 코드와 설정 파일에 쓰지 않는다. 환경 변수와 `.env`(커밋 금지)만 사용한다.

## 개발 절차

1. **설계와 계획**
   - 새 요구사항은 `/fr-start <ID>`로 시작한다.
   - 설계 명세(`docs/design/<ID>.md`) → 사용자 승인 → 구현 계획(`docs/plans/<ID>.md`, T1, T2, …) → 사용자 승인 순서로 진행한다.
   - 구현 계획이 승인되기 전에는 코드를 고치지 않는다.
2. **작업 단위 구현과 리뷰**
   - 메인 세션은 계획의 작업을 하나씩 `implementer`에게 맡긴다.
   - 끝난 작업마다 `reviewer`로 리뷰한다.
   - 심각·경고 항목은 `implementer`에게 고치게 한다. 수정과 재리뷰는 최대 2번까지다. 그래도 남으면 멈추고 사용자에게 보고한다.
3. **최종 리뷰**
   - 모든 작업이 끝나면 `critical-reviewer`에게 다음을 넘겨 최종 리뷰를 받는다:
     - 설계 명세(`docs/design/<ID>.md`)
     - `main` 대비 전체 diff
     - 작업별 리뷰 결과
   - 심각 항목은 고친다. 제안 항목은 사용자가 정한다.
4. **모델 지정 금지**: 서브에이전트를 부를 때 `model` 인자를 넘기지 않는다. 모델은 `.claude/agents/*.md`의 정의를 따른다.
5. **확대 보고**: 다음 경우에는 진행하지 말고 사용자에게 먼저 확인한다.
   - 계획에 없는 파일을 고쳐야 할 때
   - 설계를 바꿔야 할 때
   - 한 작업이 파일 3개 이상이나 여러 계층(Controller·Service·Repository·마이그레이션·프론트)에 걸칠 때
   - diff가 1,000줄 이상일 때
   - 스키마를 계획보다 더 바꿔야 하거나 여러 도메인에 걸칠 때
6. **수량 변경과 중복 방지**
   - 정원, 신청 수, 대기 순번을 바꾸는 코드는 회차 행 비관적 락 안에서 처리하고, 동시성 테스트로 검증한다(NFR-01).
   - 중복 신청 같은 중복 방지는 애플리케이션 검사만으로 끝내지 않고 DB 유일 제약(필요하면 부분 인덱스)으로 보장한다. 제약 위반은 409로 바꾼다.
