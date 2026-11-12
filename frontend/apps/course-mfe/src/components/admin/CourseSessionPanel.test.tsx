import type { CourseDetailResponse } from '@eduhub/api-client';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAdminCourseDetail } from '../../hooks/useAdminCourseDetail';
import { type CourseAdminActions, useCourseAdminActions } from '../../hooks/useCourseAdminActions';
import { ApiError } from '../../utils/apiError';
import CourseSessionPanel from './CourseSessionPanel';

vi.mock('../../hooks/useAdminCourseDetail', () => ({ useAdminCourseDetail: vi.fn() }));
vi.mock('../../hooks/useCourseAdminActions', () => ({ useCourseAdminActions: vi.fn() }));

const detailMock = vi.mocked(useAdminCourseDetail);
const actionsMock = vi.mocked(useCourseAdminActions);

const openCourse: CourseDetailResponse = {
  id: 1,
  title: 'JPA 기초',
  category: '개발',
  description: '엔티티와 영속성 컨텍스트',
  status: 'OPEN',
  sessions: [
    { id: 10, startDate: '2099-12-01', place: 'A동', capacity: 30, remainingSeats: 30, status: 'OPEN' },
    { id: 11, startDate: '2099-12-08', place: 'B동', capacity: 20, remainingSeats: 20, status: 'CLOSED' },
  ],
};

function mockActions(): CourseAdminActions {
  const actions: CourseAdminActions = {
    pending: false,
    createCourse: vi.fn(),
    updateCourse: vi.fn().mockResolvedValue({}),
    closeCourse: vi.fn().mockResolvedValue({}),
    createSession: vi.fn().mockResolvedValue({}),
    updateSession: vi.fn().mockResolvedValue({}),
    closeSession: vi.fn().mockResolvedValue({}),
  };
  actionsMock.mockReturnValue(actions);
  return actions;
}

function renderPanel(course: CourseDetailResponse = openCourse) {
  const reload = vi.fn();
  detailMock.mockReturnValue({ data: course, loading: false, error: null, reload });
  const onCourseChanged = vi.fn();
  const onNotify = vi.fn();
  render(<CourseSessionPanel courseId={course.id!} onCourseChanged={onCourseChanged} onNotify={onNotify} />);
  return { reload, onCourseChanged, onNotify };
}

describe('CourseSessionPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('과정 정보와 회차 목록을 보여 주고, 종료된 회차는 버튼을 막는다', () => {
    mockActions();
    renderPanel();

    expect(screen.getByRole('heading', { name: 'JPA 기초' })).toBeInTheDocument();
    expect(screen.getByText('엔티티와 영속성 컨텍스트')).toBeInTheDocument();
    const table = screen.getByRole('table', { name: '회차 목록' });
    expect(within(table).getByRole('cell', { name: 'A동' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2099-12-01 회차 수정' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '2099-12-08 회차 수정' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '2099-12-08 회차 종료' })).toBeDisabled();
  });

  it('종료된 과정은 수정·종료·회차 등록을 막는다', () => {
    mockActions();
    renderPanel({ ...openCourse, status: 'CLOSED' });

    expect(screen.getByRole('button', { name: '과정 수정' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '과정 종료' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '회차 등록' })).toBeDisabled();
    expect(screen.getByText('종료된 과정은 수정하거나 회차를 추가할 수 없습니다.')).toBeInTheDocument();
  });

  it('과정 종료는 확인 후 요청하고, 목록과 상세를 새로 고친다', async () => {
    const user = userEvent.setup();
    const actions = mockActions();
    const { reload, onCourseChanged, onNotify } = renderPanel();

    await user.click(screen.getByRole('button', { name: '과정 종료' }));
    const dialog = screen.getByRole('dialog');
    // 운영 중인 회차는 1개다.
    expect(dialog).toHaveTextContent('운영 중인 회차 1개도 함께 종료');
    await user.click(within(dialog).getByRole('button', { name: '종료' }));

    expect(actions.closeCourse).toHaveBeenCalledWith(1);
    await waitFor(() => expect(reload).toHaveBeenCalled());
    expect(onCourseChanged).toHaveBeenCalled();
    expect(onNotify).toHaveBeenCalledWith('과정을 종료했습니다.');
  });

  it('종료 실패 메시지를 확인 대화상자에 보여 준다', async () => {
    const user = userEvent.setup();
    const actions = mockActions();
    vi.mocked(actions.closeSession).mockRejectedValue(new ApiError('회차를 찾을 수 없습니다. id=10', 'NOT_FOUND'));
    const { reload } = renderPanel();

    await user.click(screen.getByRole('button', { name: '2099-12-01 회차 종료' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: '종료' }));

    expect(await screen.findByText('회차를 찾을 수 없습니다. id=10')).toBeInTheDocument();
    expect(reload).not.toHaveBeenCalled();
  });

  it('회차 수정 폼은 기존 값을 채우고 회차 id로 저장한다', async () => {
    const user = userEvent.setup();
    const actions = mockActions();
    const { reload, onNotify } = renderPanel();

    await user.click(screen.getByRole('button', { name: '2099-12-01 회차 수정' }));
    const place = screen.getByRole('textbox', { name: /장소/ });
    expect(place).toHaveValue('A동');
    await user.clear(place);
    await user.type(place, 'C동');
    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(actions.updateSession).toHaveBeenCalledWith(10, { startDate: '2099-12-01', place: 'C동', capacity: 30 });
    await waitFor(() => expect(reload).toHaveBeenCalled());
    expect(onNotify).toHaveBeenCalledWith('회차를 수정했습니다.');
  });

  it('불러오지 못하면 오류를 보여 준다', () => {
    mockActions();
    detailMock.mockReturnValue({ data: null, loading: false, error: new Error('Network Error'), reload: vi.fn() });

    render(<CourseSessionPanel courseId={1} onCourseChanged={vi.fn()} onNotify={vi.fn()} />);

    expect(screen.getByRole('alert')).toHaveTextContent('과정 상세를 불러오지 못했습니다. (Network Error)');
  });
});
