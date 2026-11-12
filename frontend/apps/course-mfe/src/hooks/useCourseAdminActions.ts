import type {
  CourseDetailResponse,
  CourseRequest,
  SessionRequest,
  SessionResponse,
} from '@eduhub/api-client';
import { useCallback, useMemo, useState } from 'react';
import { courseAdminApi } from '../api/courseAdminApi';
import { toApiError } from '../utils/apiError';

export interface CourseAdminActions {
  /** 요청이 하나라도 진행 중이면 true. 버튼을 막는 데 쓴다. */
  pending: boolean;
  createCourse: (request: CourseRequest) => Promise<CourseDetailResponse>;
  updateCourse: (courseId: number, request: CourseRequest) => Promise<CourseDetailResponse>;
  closeCourse: (courseId: number) => Promise<CourseDetailResponse>;
  createSession: (courseId: number, request: SessionRequest) => Promise<SessionResponse>;
  updateSession: (sessionId: number, request: SessionRequest) => Promise<SessionResponse>;
  closeSession: (sessionId: number) => Promise<SessionResponse>;
}

/**
 * 관리자의 과정·회차 등록·수정·종료 (FR-03). 화면 컴포넌트는 courseAdminApi 대신 이 훅을 쓴다.
 * 실패하면 ApiError(code, fieldErrors)를 던진다.
 */
export function useCourseAdminActions(): CourseAdminActions {
  const [pendingCount, setPendingCount] = useState(0);

  const run = useCallback(async <T>(call: () => Promise<{ data: T }>): Promise<T> => {
    setPendingCount((c) => c + 1);
    try {
      return (await call()).data;
    } catch (e) {
      throw toApiError(e);
    } finally {
      setPendingCount((c) => c - 1);
    }
  }, []);

  const actions = useMemo(
    () => ({
      createCourse: (courseRequest: CourseRequest) => run(() => courseAdminApi.createCourse({ courseRequest })),
      updateCourse: (courseId: number, courseRequest: CourseRequest) =>
        run(() => courseAdminApi.updateCourse({ courseId, courseRequest })),
      closeCourse: (courseId: number) => run(() => courseAdminApi.closeCourse({ courseId })),
      createSession: (courseId: number, sessionRequest: SessionRequest) =>
        run(() => courseAdminApi.createSession({ courseId, sessionRequest })),
      updateSession: (sessionId: number, sessionRequest: SessionRequest) =>
        run(() => courseAdminApi.updateSession({ sessionId, sessionRequest })),
      closeSession: (sessionId: number) => run(() => courseAdminApi.closeSession({ sessionId })),
    }),
    [run],
  );

  return { pending: pendingCount > 0, ...actions };
}
