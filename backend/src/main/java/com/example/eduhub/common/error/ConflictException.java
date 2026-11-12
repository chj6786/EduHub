package com.example.eduhub.common.error;

/**
 * 현재 상태에서 할 수 없는 요청일 때 던진다(예: 종료된 과정 수정). GlobalExceptionHandler가 409로 바꾼다.
 *
 * <p>code는 ErrorResponse.code로 그대로 나간다(예: COURSE_CLOSED).
 */
public class ConflictException extends RuntimeException {

  private final String code;

  public ConflictException(String code, String message) {
    super(message);
    this.code = code;
  }

  public String getCode() {
    return code;
  }
}
