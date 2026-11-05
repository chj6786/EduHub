import type { PageResponseCourseSummaryResponse } from '@eduhub/api-client';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { courseApi } from '../api/courseApi';
import { useCourses } from './useCourses';

vi.mock('../api/courseApi', () => ({
  courseApi: { list: vi.fn() },
}));

const listMock = vi.mocked(courseApi.list);

const page: PageResponseCourseSummaryResponse = {
  content: [{ id: 1, title: 'JPA 기초', category: '개발', status: 'OPEN' }],
  page: 0,
  size: 20,
  totalElements: 1,
};

describe('useCourses', () => {
  beforeEach(() => {
    listMock.mockReset();
  });

  it('목록을 불러온다', async () => {
    listMock.mockResolvedValue({ data: page } as Awaited<ReturnType<typeof courseApi.list>>);

    const { result } = renderHook(() =>
      useCourses({ keyword: 'jpa', category: '개발', page: 2, size: 10 }),
    );

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(page);
    expect(result.current.error).toBeNull();
    // page는 0부터 받은 그대로 API에 넘긴다.
    expect(listMock).toHaveBeenCalledWith({ keyword: 'jpa', category: '개발', page: 2, size: 10 });
  });

  it('빈 검색 조건은 보내지 않는다', async () => {
    listMock.mockResolvedValue({ data: page } as Awaited<ReturnType<typeof courseApi.list>>);

    const { result } = renderHook(() => useCourses({ keyword: '', category: '', page: 0, size: 20 }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(listMock).toHaveBeenCalledWith({ keyword: undefined, category: undefined, page: 0, size: 20 });
  });

  it('실패하면 error를 채운다', async () => {
    listMock.mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useCourses({ page: 0, size: 20 }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error?.message).toBe('Network Error');
    expect(result.current.data).toBeNull();
  });
});
