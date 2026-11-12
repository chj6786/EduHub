import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SessionFormDialog from './SessionFormDialog';

describe('SessionFormDialog', () => {
  it('입력값을 숫자 정원과 함께 제출한다', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<SessionFormDialog open mode="create" onSubmit={onSubmit} onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/시작일/), { target: { value: '2099-12-01' } });
    await user.type(screen.getByRole('textbox', { name: /장소/ }), ' 본사 3층 ');
    await user.type(screen.getByRole('spinbutton', { name: /정원/ }), '30');
    await user.click(screen.getByRole('button', { name: '등록' }));

    expect(onSubmit).toHaveBeenCalledWith({ startDate: '2099-12-01', place: '본사 3층', capacity: 30 });
  });

  it('지난 날짜와 범위를 벗어난 정원은 막는다', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SessionFormDialog open mode="create" onSubmit={onSubmit} onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/시작일/), { target: { value: '2000-01-01' } });
    await user.type(screen.getByRole('textbox', { name: /장소/ }), 'A동');
    await user.type(screen.getByRole('spinbutton', { name: /정원/ }), '0');
    await user.click(screen.getByRole('button', { name: '등록' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('시작일은 오늘 이후여야 합니다.')).toBeInTheDocument();
    expect(screen.getByText('정원은 1~1000 사이의 정수로 입력해 주세요.')).toBeInTheDocument();
  });

  it('수정 모드는 기존 값을 채운다', () => {
    render(
      <SessionFormDialog
        open
        mode="edit"
        initialValues={{ startDate: '2099-12-01', place: 'A동', capacity: 30 }}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/시작일/)).toHaveValue('2099-12-01');
    expect(screen.getByRole('textbox', { name: /장소/ })).toHaveValue('A동');
    expect(screen.getByRole('spinbutton', { name: /정원/ })).toHaveValue(30);
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
  });
});
