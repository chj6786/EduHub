import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCourses } from '../hooks/useCourses';
import CourseListPage from './CourseListPage';

vi.mock('../hooks/useCourses', () => ({
  useCourses: vi.fn(),
}));

const useCoursesMock = vi.mocked(useCourses);

describe('CourseListPage', () => {
  beforeEach(() => {
    useCoursesMock.mockReset();
  });

  it('과정 목록을 표로 보여준다', () => {
    useCoursesMock.mockReturnValue({
      data: {
        content: [
          { id: 1, title: 'JPA 기초', category: '개발', status: 'OPEN' },
          { id: 2, title: '리더십 101', category: '리더십', status: 'CLOSED' },
        ],
        page: 0,
        size: 20,
        totalElements: 2,
      },
      loading: false,
      error: null,
    });

    render(<CourseListPage />);

    expect(screen.getByRole('cell', { name: 'JPA 기초' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '개발' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '리더십 101' })).toBeInTheDocument();
    expect(screen.getByText('운영중')).toBeInTheDocument();
    expect(screen.getByText('종료')).toBeInTheDocument();
    // 첫 화면은 0페이지, 20건씩 조회한다.
    expect(useCoursesMock).toHaveBeenCalledWith({ keyword: '', category: '', page: 0, size: 20 });
  });

  it('불러오지 못하면 에러 메시지를 보여준다', () => {
    useCoursesMock.mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Network Error'),
    });

    render(<CourseListPage />);

    expect(screen.getByRole('alert')).toHaveTextContent('과정 목록을 불러오지 못했습니다. (Network Error)');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('불러오는 중에는 로딩 표시를 보여준다', () => {
    useCoursesMock.mockReturnValue({ data: null, loading: true, error: null });

    render(<CourseListPage />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
