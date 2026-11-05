# frontend/CLAUDE.md

- UI는 MUI 컴포넌트로 만든다.
- API 호출은 백엔드 OpenAPI 스펙에서 생성한 Axios 클라이언트로만 한다. 요청 코드를 손으로 쓰지 않는다(NFR-04).
- 서버 데이터 조회는 커스텀 훅(`src/hooks/useXxx.ts`)으로 감싼다.
- 화면 컴포넌트는 API를 직접 부르지 않고 커스텀 훅을 쓴다.
