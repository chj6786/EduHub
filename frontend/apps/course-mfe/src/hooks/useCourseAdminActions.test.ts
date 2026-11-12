import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { courseAdminApi } from '../api/courseAdminApi';
import { ApiError } from '../utils/apiError';
import { useCourseAdminActions } from './useCourseAdminActions';

vi.mock('../api/courseAdminApi', () => ({
  courseAdminApi: {
    createCourse: vi.fn(),
    updateCourse: vi.fn(),
    closeCourse: vi.fn(),
    createSession: vi.fn(),
    updateSession: vi.fn(),
    closeSession: vi.fn(),
  },
}));

const api = vi.mocked(courseAdminApi);
type Resp<K extends keyof typeof courseAdminApi> = Awaited<ReturnType<(typeof courseAdminApi)[K]>>;

describe('useCourseAdminActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('과정 등록 요청을 보내고 응답 본문을 돌려준다', async () => {
    const created = { id: 7, title: 'JPA 기초', category: '개발', status: 'OPEN' as const, sessions: [] };
    api.createCourse.mockResolvedValue({ data: created } as unknown as Resp<'createCourse'>);
    const { result } = renderHook(() => useCourseAdminActions());

    let returned;
    await act(async () => {
      returned = await result.current.createCourse({ title: 'JPA 기초', category: '개발' });
    });

    expect(returned).toEqual(created);
    expect(api.createCourse).toHaveBeenCalledWith({ courseRequest: { title: 'JPA 기초', category: '개발' } });
    expect(result.current.pending).toBe(false);
  });

  it('회차 요청은 경로 id와 본문을 나눠 보낸다', async () => {
    api.createSession.mockResolvedValue({ data: { id: 10 } } as unknown as Resp<'createSession'>);
    api.updateSession.mockResolvedValue({ data: { id: 10 } } as unknown as Resp<'updateSession'>);
    api.closeSession.mockResolvedValue({ data: { id: 10 } } as unknown as Resp<'closeSession'>);
    api.closeCourse.mockResolvedValue({ data: { id: 1 } } as unknown as Resp<'closeCourse'>);
    api.updateCourse.mockResolvedValue({ data: { id: 1 } } as unknown as Resp<'updateCourse'>);
    const { result } = renderHook(() => useCourseAdminActions());
    const request = { startDate: '2099-01-01', place: 'A동', capacity: 30 };

    await act(async () => {
      await result.current.createSession(1, request);
      await result.current.updateSession(10, request);
      await result.current.closeSession(10);
      await result.current.closeCourse(1);
      await result.current.updateCourse(1, { title: 't', category: '개발' });
    });

    expect(api.createSession).toHaveBeenCalledWith({ courseId: 1, sessionRequest: request });
    expect(api.updateSession).toHaveBeenCalledWith({ sessionId: 10, sessionRequest: request });
    expect(api.closeSession).toHaveBeenCalledWith({ sessionId: 10 });
    expect(api.closeCourse).toHaveBeenCalledWith({ courseId: 1 });
    expect(api.updateCourse).toHaveBeenCalledWith({ courseId: 1, courseRequest: { title: 't', category: '개발' } });
  });

  it('실패하면 서버 오류를 ApiError로 바꿔 던진다', async () => {
    api.updateCourse.mockRejectedValue({
      response: { data: { code: 'COURSE_CLOSED', message: '종료된 과정입니다. id=1' } },
    });
    const { result } = renderHook(() => useCourseAdminActions());

    let caught: unknown;
    await act(async () => {
      try {
        await result.current.updateCourse(1, { title: 't', category: '개발' });
      } catch (e) {
        caught = e;
      }
    });

    expect(caught).toBeInstanceOf(ApiError);
    expect((caught as ApiError).code).toBe('COURSE_CLOSED');
    expect(result.current.pending).toBe(false);
  });

  it('요청 중에는 pending이 true다', async () => {
    let resolve: (v: Resp<'closeCourse'>) => void = () => {};
    api.closeCourse.mockReturnValue(new Promise((r) => (resolve = r)) as ReturnType<typeof api.closeCourse>);
    const { result } = renderHook(() => useCourseAdminActions());

    let promise: Promise<unknown>;
    act(() => {
      promise = result.current.closeCourse(1);
    });
    expect(result.current.pending).toBe(true);

    await act(async () => {
      resolve({ data: { id: 1 } } as unknown as Resp<'closeCourse'>);
      await promise;
    });
    expect(result.current.pending).toBe(false);
  });
});
