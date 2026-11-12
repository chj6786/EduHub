import type { CourseDetailResponse } from '@eduhub/api-client';
import { useEffect, useState } from 'react';
import { courseApi } from '../api/courseApi';

export interface UseCourseDetailResult {
  data: CourseDetailResponse | null;
  loading: boolean;
  error: Error | null;
  /** 백엔드가 404(과정 없음)를 돌려주면 true. 이때 error도 함께 채워진다. */
  notFound: boolean;
}

/** axios 오류의 HTTP 상태 코드. course-mfe가 axios에 직접 의존하지 않도록 모양으로만 확인한다. */
function httpStatusOf(e: unknown): number | undefined {
  if (typeof e === 'object' && e !== null && 'response' in e) {
    const response = (e as { response?: { status?: unknown } }).response;
    return typeof response?.status === 'number' ? response.status : undefined;
  }
  return undefined;
}

/** 과정 상세와 회차 조회 (FR-02). 화면 컴포넌트는 courseApi 대신 이 훅을 쓴다. */
export function useCourseDetail(courseId: number): UseCourseDetailResult {
  const [data, setData] = useState<CourseDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // 다른 과정으로 빨리 바뀌면 이전 요청의 늦은 응답을 버린다.
    let ignore = false;
    setData(null);
    setLoading(true);
    setError(null);
    setNotFound(false);

    courseApi
      .detail({ id: courseId })
      .then((response) => {
        if (!ignore) setData(response.data);
      })
      .catch((e: unknown) => {
        if (ignore) return;
        setError(e instanceof Error ? e : new Error(String(e)));
        setNotFound(httpStatusOf(e) === 404);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [courseId]);

  return { data, loading, error, notFound };
}
