import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import CourseApp from './CourseApp';
import { useCourseDetail } from './hooks/useCourseDetail';
import { useCourses } from './hooks/useCourses';

vi.mock('./hooks/useCourses', () => ({ useCourses: vi.fn() }));
vi.mock('./hooks/useCourseDetail', () => ({ useCourseDetail: vi.fn() }));

vi.mocked(useCourses).mockReturnValue({
  data: {
    content: [{ id: 7, title: 'JPA 기초', category: '개발', status: 'OPEN' }],
    page: 0,
    size: 20,
    totalElements: 1,
  },
  loading: false,
  error: null,
});
vi.mocked(useCourseDetail).mockReturnValue({
  data: { id: 7, title: 'JPA 상세', category: '개발', status: 'OPEN', sessions: [] },
  loading: false,
  error: null,
  notFound: false,
});

describe('CourseApp', () => {
  it('목록에서 상세로 갔다가 돌아온다', async () => {
    const user = userEvent.setup();
    render(<CourseApp />);

    await user.click(screen.getByRole('cell', { name: 'JPA 기초' }));
    expect(screen.getByRole('heading', { name: 'JPA 상세' })).toBeInTheDocument();
    expect(useCourseDetail).toHaveBeenCalledWith(7);
    // 목록은 숨기기만 한다.
    expect(screen.queryByRole('heading', { name: '교육과정' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /과정 목록으로/ }));
    expect(screen.getByRole('heading', { name: '교육과정' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'JPA 상세' })).not.toBeInTheDocument();
  });
});
