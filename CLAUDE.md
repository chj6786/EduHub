# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트

EduHub: 사내 교육과정 조회·수강 신청 시스템. 정원이 차면 대기자로 등록되고, 취소 시 대기 1순위가 자동 확정된다.
요구사항(FR-xx, NFR-xx, 결정 사항 D-xx)과 주차별 범위는 `docs/requirements.md`가 기준이다. 코드 주석에 해당 요구사항 ID를 달아 근거를 남긴다.

## 디렉터리 지도

- `backend/`: Spring Boot API (Java 8, Spring Boot 2.7). 규칙은 `backend/CLAUDE.md`
- `frontend/`: React 18 + TypeScript, Module Federation(shell / course-mfe / enrollment-mfe), MUI, Axios, npm workspaces. 아직 코드는 없다. 규칙은 `frontend/CLAUDE.md`
- `docs/`: 요구사항 문서 `docs/requirements.md`
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
