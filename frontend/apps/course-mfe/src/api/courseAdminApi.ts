import { Configuration, CourseAdminApi } from '@eduhub/api-client';

// 관리자용 생성 클라이언트 인스턴스는 여기서만 만든다 (FR-03, NFR-04). basePath 설명은 courseApi.ts와 같다.
// TODO(NFR-03): 인증이 생기면 관리자 토큰을 Configuration에 넣는다. 지금은 권한 검사가 없다(D-01).
export const courseAdminApi = new CourseAdminApi(new Configuration({ basePath: window.location.origin }));
