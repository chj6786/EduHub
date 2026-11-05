import { Configuration, CourseApi } from '@eduhub/api-client';

// 생성된 CourseApi 인스턴스는 여기서만 만든다 (frontend/CLAUDE.md, NFR-04).
// basePath를 비우면 생성 코드가 스펙의 서버 주소(localhost:8080)로 돌아가므로, 현재 출처를 넘겨 개발 서버 프록시(/api)를 타게 한다.
export const courseApi = new CourseApi(new Configuration({ basePath: window.location.origin }));
