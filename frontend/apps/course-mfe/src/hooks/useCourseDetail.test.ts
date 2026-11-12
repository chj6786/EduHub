import type { CourseDetailResponse } from '@eduhub/api-client';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { courseApi } from '../api/courseApi';
import { useCourseDetail } from './useCourseDetail';

vi.mock('../api/courseApi', () => ({
  courseApi: { detail: vi.fn() },
}));

const detailMock = vi.mocked(courseApi.detail);

const course: CourseDetailResponse = {
  id: 1,
  title: 'JPA 기초',
  category: '개발',
  description: 'JPA 입문 과정',
  status: 'OPEN',
  sessions: [
    { id: 10, startDate: '2026-12-01', place: '본사 3층', capacity: 20, remainingSeats: 20, status: 'OPEN' },
  ],
};

describe('useCourseDetail', () => {
  beforeEach(() => {
    detailMock.mockReset();
  });

  it('과정 상세를 불러온다', async () => {
    detailMock.mockResolvedValue({ data: course } as Awaited<ReturnType<typeof courseApi.detail>>);

    const { result } = renderHook(() => useCourseDetail(1));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(course);
    expect(result.current.error).toBeNull();
    expect(result.current.notFound).toBe(false);
    expect(detailMock).toHaveBeenCalledWith({ id: 1 });
  });

  it('404면 notFound를 켠다', async () => {
    const error = Object.assign(new Error('Request failed with status code 404'), {
      response: { status: 404 },
    });
    detailMock.mockRejectedValue(error);

    const { result } = renderHook(() => useCourseDetail(999));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.notFound).toBe(true);
    expect(result.current.error).toBe(error);
    expect(result.current.data).toBeNull();
  });

  it('그 밖의 실패는 error만 채운다', async () => {
    detailMock.mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useCourseDetail(1));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error?.message).toBe('Network Error');
    expect(result.current.notFound).toBe(false);
    expect(result.current.data).toBeNull();
  });

  it('id가 바뀌면 다시 불러온다', async () => {
    detailMock.mockResolvedValue({ data: course } as Awaited<ReturnType<typeof courseApi.detail>>);

    const { result, rerender } = renderHook(({ id }) => useCourseDetail(id), {
      initialProps: { id: 1 },
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    rerender({ id: 2 });
    await waitFor(() => expect(detailMock).toHaveBeenLastCalledWith({ id: 2 }));
    await waitFor(() => expect(result.current.loading).toBe(false));
  });
});
