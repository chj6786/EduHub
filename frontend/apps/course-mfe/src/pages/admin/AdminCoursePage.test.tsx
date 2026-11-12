import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAdminCourseDetail } from '../../hooks/useAdminCourseDetail';
import { type CourseAdminActions, useCourseAdminActions } from '../../hooks/useCourseAdminActions';
import { useCourses } from '../../hooks/useCourses';
import AdminCoursePage from './AdminCoursePage';

vi.mock('../../hooks/useCourses', () => ({ useCourses: vi.fn() }));
vi.mock('../../hooks/useAdminCourseDetail', () => ({ useAdminCourseDetail: vi.fn() }));
vi.mock('../../hooks/useCourseAdminActions', () => ({ useCourseAdminActions: vi.fn() }));

const useCoursesMock = vi.mocked(useCourses);
const detailMock = vi.mocked(useAdminCourseDetail);
const actionsMock = vi.mocked(useCourseAdminActions);

const createCourse = vi.fn();

describe('AdminCoursePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCoursesMock.mockReturnValue({
      data: {
        content: [
          { id: 2, title: '리더십 101', category: '리더십', status: 'CLOSED' },
          { id: 1, title: 'JPA 기초', category: '개발', status: 'OPEN' },
        ],
        page: 0,
        size: 20,
        totalElements: 2,
      },
      loading: false,
      error: null,
    });
    detailMock.mockImplementation((id) => ({
      data: id === null ? null : { id, title: `과정 ${id}`, category: '개발', status: 'OPEN', sessions: [] },
      loading: false,
      error: null,
      reload: vi.fn(),
    }));
    actionsMock.mockReturnValue({ pending: false, createCourse } as unknown as CourseAdminActions);
  });

  it('종료된 과정을 포함한 목록을 보여 주고, 처음에는 상세를 열지 않는다', () => {
    render(<AdminCoursePage />);

    const table = screen.getByRole('table', { name: '과정 목록' });
    expect(within(table).getByRole('cell', { name: 'JPA 기초' })).toBeInTheDocument();
    expect(within(table).getByText('종료')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: '과정 상세 관리' })).not.toBeInTheDocument();
  });

  it('행을 누르면 그 과정의 상세 관리가 열린다', async () => {
    const user = userEvent.setup();
    render(<AdminCoursePage />);

    await user.click(screen.getByRole('cell', { name: 'JPA 기초' }));

    expect(detailMock).toHaveBeenLastCalledWith(1);
    expect(screen.getByRole('region', { name: '과정 상세 관리' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '과정 1' })).toBeInTheDocument();
  });

  it('과정을 등록하면 새 과정을 선택하고 목록을 다시 불러온다', async () => {
    const user = userEvent.setup();
    createCourse.mockResolvedValue({ id: 3, title: '새 과정', category: '데이터', status: 'OPEN', sessions: [] });
    render(<AdminCoursePage />);
    expect(useCoursesMock).toHaveBeenLastCalledWith(expect.objectContaining({ refreshKey: 0 }));

    await user.click(screen.getByRole('button', { name: '과정 등록' }));
    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByRole('textbox', { name: /과정명/ }), '새 과정');
    await user.click(within(dialog).getByRole('combobox', { name: /분류/ }));
    await user.click(screen.getByRole('option', { name: '데이터' }));
    await user.click(within(dialog).getByRole('button', { name: '등록' }));

    expect(createCourse).toHaveBeenCalledWith({ title: '새 과정', category: '데이터', description: undefined });
    await waitFor(() => expect(detailMock).toHaveBeenLastCalledWith(3));
    // 같은 조건(첫 페이지, 검색 조건 없음)으로 다시 불러온다.
    expect(useCoursesMock).toHaveBeenLastCalledWith({ keyword: '', category: '', page: 0, size: 20, refreshKey: 1 });
    expect(await screen.findByText('과정을 등록했습니다.')).toBeInTheDocument();
  });
});
