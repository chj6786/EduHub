import type { ErrorResponse } from '@eduhub/api-client';

/** 백엔드 ErrorResponse를 화면에서 쓰기 쉬운 모양으로 바꾼 오류. fieldErrors는 필드 이름 → 메시지. */
export class ApiError extends Error {
  readonly code?: string;
  readonly fieldErrors: Record<string, string>;

  constructor(message: string, code?: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

/** Axios 오류(response.data가 ErrorResponse)든 다른 오류든 ApiError로 바꾼다. */
export function toApiError(e: unknown): ApiError {
  if (e instanceof ApiError) return e;

  const body = (e as { response?: { data?: unknown } } | null)?.response?.data as ErrorResponse | undefined;
  if (body && typeof body === 'object' && body.message) {
    const fieldErrors: Record<string, string> = {};
    for (const fe of body.fieldErrors ?? []) {
      // 같은 필드에 오류가 여러 개면 첫 번째만 보여 준다.
      if (fe.field && fe.message && !fieldErrors[fe.field]) fieldErrors[fe.field] = fe.message;
    }
    return new ApiError(body.message, body.code, fieldErrors);
  }
  return new ApiError(e instanceof Error ? e.message : String(e));
}
