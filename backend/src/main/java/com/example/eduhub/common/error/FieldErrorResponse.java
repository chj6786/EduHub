package com.example.eduhub.common.error;

/** 입력 검증에 실패한 필드 하나. 화면이 입력란 옆에 메시지를 표시할 때 쓴다. */
public class FieldErrorResponse {

  private final String field;
  private final String message;

  public FieldErrorResponse(String field, String message) {
    this.field = field;
    this.message = message;
  }

  public String getField() {
    return field;
  }

  public String getMessage() {
    return message;
  }
}
