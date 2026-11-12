import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../utils/apiError';
import CourseFormDialog from './CourseFormDialog';

describe('CourseFormDialog', () => {
  it('입력값을 다듬어 제출한다', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<CourseFormDialog open mode="create" onSubmit={onSubmit} onClose={vi.fn()} />);

    await user.type(screen.getByRole('textbox', { name: /과정명/ }), '  JPA 기초  ');
    await user.click(screen.getByRole('combobox', { name: /분류/ }));
    await user.click(within(screen.getByRole('listbox')).getByRole('option', { name: '개발' }));
    await user.click(screen.getByRole('button', { name: '등록' }));

    expect(onSubmit).toHaveBeenCalledWith({ title: 'JPA 기초', category: '개발', description: undefined });
  });

  it('필수값이 비면 제출하지 않고 오류를 보여 준다', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CourseFormDialog open mode="create" onSubmit={onSubmit} onClose={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: '등록' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('과정명을 입력해 주세요.')).toBeInTheDocument();
    expect(screen.getByText('분류를 선택해 주세요.')).toBeInTheDocument();
  });

  it('수정 모드는 기존 값을 채우고, 서버 오류를 폼에 보여 준다', async () => {
    const user = userEvent.setup();
    const onSubmit = vi
      .fn()
      .mockRejectedValue(new ApiError('종료된 과정입니다. id=1', 'COURSE_CLOSED'));
    render(
      <CourseFormDialog
        open
        mode="edit"
        initialValues={{ title: 'JPA 기초', category: '개발', description: '설명' }}
        onSubmit={onSubmit}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole('textbox', { name: /과정명/ })).toHaveValue('JPA 기초');
    expect(screen.getByRole('textbox', { name: '설명' })).toHaveValue('설명');

    await user.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('종료된 과정입니다. id=1'));
  });

  it('서버 필드 오류는 해당 입력란 아래에 보여 준다', async () => {
    const user = userEvent.setup();
    const onSubmit = vi
      .fn()
      .mockRejectedValue(new ApiError('입력값을 확인해 주세요.', 'VALIDATION_ERROR', { title: '서버 검증 메시지' }));
    render(
      <CourseFormDialog
        open
        mode="edit"
        initialValues={{ title: 'JPA', category: '개발' }}
        onSubmit={onSubmit}
        onClose={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(await screen.findByText('서버 검증 메시지')).toBeInTheDocument();
  });
});
