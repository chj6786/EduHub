import type { CourseDetailResponse } from '@eduhub/api-client';
import { useCallback, useEffect, useState } from 'react';
import { courseApi } from '../api/courseApi';

export interface UseAdminCourseDetailResult {
  data: CourseDetailResponse | null;
  loading: boolean;
  error: Error | null;
  /** 등록·수정·종료 뒤 다시 불러온다. */
  reload: () => void;
}

/** 관리자 화면에서 선택한 과정의 상세와 회차 (FR-03). courseId가 null이면 조회하지 않는다. */
export function useAdminCourseDetail(courseId: number | null): UseAdminCourseDetailResult {
  const [data, setData] = useState<CourseDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (courseId === null) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    // 다른 과정을 빨리 고르면 이전 요청의 늦은 응답을 버린다.
    let ignore = false;
    setLoading(true);
    setError(null);

    courseApi
      .detail({ id: courseId })
      .then((response) => {
        if (!ignore) setData(response.data);
      })
      .catch((e: unknown) => {
        if (!ignore) setError(e instanceof Error ? e : new Error(String(e)));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [courseId, reloadCount]);

  const reload = useCallback(() => setReloadCount((c) => c + 1), []);

  return { data, loading, error, reload };
}
