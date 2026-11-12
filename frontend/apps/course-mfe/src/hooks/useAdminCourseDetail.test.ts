import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { courseApi } from '../api/courseApi';
import { useAdminCourseDetail } from './useAdminCourseDetail';

vi.mock('../api/courseApi', () => ({
  courseApi: { detail: vi.fn() },
}));

const detailMock = vi.mocked(courseApi.detail);
type DetailResp = Awaited<ReturnType<typeof courseApi.detail>>;

const course = { id: 1, title: 'JPA 기초', category: '개발', status: 'OPEN' as const, sessions: [] };

describe('useAdminCourseDetail', () => {
  beforeEach(() => {
    detailMock.mockReset();
  });

  it('선택한 과정의 상세를 불러온다', async () => {
    detailMock.mockResolvedValue({ data: course } as unknown as DetailResp);

    const { result } = renderHook(() => useAdminCourseDetail(1));
    await waitFor(() => expect(result.current.data).toEqual(course));

    expect(detailMock).toHaveBeenCalledWith({ id: 1 });
    expect(result.current.loading).toBe(false);
  });

  it('courseId가 null이면 조회하지 않는다', () => {
    const { result } = renderHook(() => useAdminCourseDetail(null));

    expect(detailMock).not.toHaveBeenCalled();
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('reload를 부르면 다시 불러온다', async () => {
    detailMock.mockResolvedValue({ data: course } as unknown as DetailResp);
    const { result } = renderHook(() => useAdminCourseDetail(1));
    await waitFor(() => expect(result.current.loading).toBe(false));

    detailMock.mockResolvedValue({ data: { ...course, status: 'CLOSED' } } as unknown as DetailResp);
    act(() => result.current.reload());

    await waitFor(() => expect(result.current.data?.status).toBe('CLOSED'));
    expect(detailMock).toHaveBeenCalledTimes(2);
  });

  it('실패하면 error를 채운다', async () => {
    detailMock.mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useAdminCourseDetail(1));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error?.message).toBe('Network Error');
  });
});
