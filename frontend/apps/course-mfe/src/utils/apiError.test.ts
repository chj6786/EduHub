import { describe, expect, it } from 'vitest';
import { ApiError, toApiError } from './apiError';

describe('toApiError', () => {
  it('ErrorResponse 본문의 code, message, fieldErrors를 옮긴다', () => {
    const axiosLike = {
      message: 'Request failed with status code 400',
      response: {
        data: {
          code: 'VALIDATION_ERROR',
          message: '입력값을 확인해 주세요.',
          fieldErrors: [
            { field: 'title', message: '과정명을 입력해 주세요.' },
            { field: 'title', message: '두 번째 메시지' },
            { field: 'category', message: '분류를 입력해 주세요.' },
          ],
        },
      },
    };

    const error = toApiError(axiosLike);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.message).toBe('입력값을 확인해 주세요.');
    expect(error.fieldErrors).toEqual({ title: '과정명을 입력해 주세요.', category: '분류를 입력해 주세요.' });
  });

  it('본문이 없으면 원래 오류 메시지를 쓴다', () => {
    const error = toApiError(new Error('Network Error'));

    expect(error.message).toBe('Network Error');
    expect(error.code).toBeUndefined();
    expect(error.fieldErrors).toEqual({});
  });

  it('이미 ApiError면 그대로 돌려준다', () => {
    const original = new ApiError('x', 'COURSE_CLOSED');

    expect(toApiError(original)).toBe(original);
  });
});
