import type { PageResponseCourseSummaryResponse } from '@eduhub/api-client';
import { useEffect, useState } from 'react';
import { courseApi } from '../api/courseApi';

export interface UseCoursesParams {
  keyword?: string;
  category?: string;
  /** 0부터 시작. 받은 값을 그대로 API에 넘긴다 (백엔드 Pageable, MUI TablePagination 모두 0부터). */
  page: number;
  size: number;
}

export interface UseCoursesResult {
  data: PageResponseCourseSummaryResponse | null;
  loading: boolean;
  error: Error | null;
}

/** 과정 목록 조회 (FR-01). 화면 컴포넌트는 courseApi 대신 이 훅을 쓴다. */
export function useCourses({ keyword, category, page, size }: UseCoursesParams): UseCoursesResult {
  const [data, setData] = useState<PageResponseCourseSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // 조건이 빨리 바뀌면 이전 요청의 늦은 응답을 버린다.
    let ignore = false;
    setLoading(true);
    setError(null);

    courseApi
      .list({ keyword: keyword || undefined, category: category || undefined, page, size })
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
  }, [keyword, category, page, size]);

  return { data, loading, error };
}
