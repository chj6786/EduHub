import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCourseDetail } from '../hooks/useCourseDetail';
import CourseDetailPage from './CourseDetailPage';

vi.mock('../hooks/useCourseDetail', () => ({
  useCourseDetail: vi.fn(),
}));

const useCourseDetailMock = vi.mocked(useCourseDetail);

describe('CourseDetailPage', () => {
  beforeEach(() => {
    useCourseDetailMock.mockReset();
  });

  it('과정 정보와 회차 표를 보여준다', () => {
    useCourseDetailMock.mockReturnValue({
      data: {
        id: 1,
        title: 'JPA 기초',
        category: '개발',
        description: 'JPA 입문 과정',
        status: 'OPEN',
        sessions: [
          { id: 10, startDate: '2026-12-01', place: '본사 3층', capacity: 20, remainingSeats: 15, status: 'OPEN' },
          { id: 11, startDate: '2026-12-15', place: '온라인', capacity: 30, remainingSeats: 30, status: 'CLOSED' },
        ],
      },
      loading: false,
      error: null,
      notFound: false,
    });

    render(<CourseDetailPage courseId={1} onBack={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'JPA 기초' })).toBeInTheDocument();
    expect(screen.getByText('JPA 입문 과정')).toBeInTheDocument();
    expect(useCourseDetailMock).toHaveBeenCalledWith(1);

    const rows = screen.getAllByRole('row');
    // 머리글 1행 + 회차 2행
    expect(rows).toHaveLength(3);
    const first = within(rows[1]);
    expect(first.getByRole('cell', { name: '2026-12-01' })).toBeInTheDocument();
    expect(first.getByRole('cell', { name: '본사 3층' })).toBeInTheDocument();
    expect(first.getByRole('cell', { name: '20' })).toBeInTheDocument();
    expect(first.getByRole('cell', { name: '15' })).toBeInTheDocument();
    expect(first.getByText('운영중')).toBeInTheDocument();
    expect(within(rows[2]).getByText('종료')).toBeInTheDocument();
  });

  it('회차가 없으면 안내 문구를 보여준다', () => {
    useCourseDetailMock.mockReturnValue({
      data: { id: 1, title: 'JPA 기초', category: '개발', status: 'OPEN', sessions: [] },
      loading: false,
      error: null,
      notFound: false,
    });

    render(<CourseDetailPage courseId={1} onBack={vi.fn()} />);

    expect(screen.getByText('등록된 회차가 없습니다.')).toBeInTheDocument();
  });

  it('과정이 없으면 404 안내를 보여준다', () => {
    useCourseDetailMock.mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Request failed with status code 404'),
      notFound: true,
    });

    render(<CourseDetailPage courseId={999} onBack={vi.fn()} />);

    expect(screen.getByRole('alert')).toHaveTextContent('과정을 찾을 수 없습니다.');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('불러오지 못하면 에러 메시지를 보여준다', () => {
    useCourseDetailMock.mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Network Error'),
      notFound: false,
    });

    render(<CourseDetailPage courseId={1} onBack={vi.fn()} />);

    expect(screen.getByRole('alert')).toHaveTextContent('과정 정보를 불러오지 못했습니다. (Network Error)');
  });

  it('불러오는 중에는 로딩 표시를 보여준다', () => {
    useCourseDetailMock.mockReturnValue({ data: null, loading: true, error: null, notFound: false });

    render(<CourseDetailPage courseId={1} onBack={vi.fn()} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('목록으로 버튼을 누르면 onBack을 부른다', async () => {
    useCourseDetailMock.mockReturnValue({ data: null, loading: true, error: null, notFound: false });
    const onBack = vi.fn();

    render(<CourseDetailPage courseId={1} onBack={onBack} />);
    await userEvent.click(screen.getByRole('button', { name: /과정 목록으로/ }));

    expect(onBack).toHaveBeenCalled();
  });
});
