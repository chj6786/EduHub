package com.example.eduhub.common.error;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.Collections;
import java.util.List;

/** 공통 에러 응답. code는 기계가 읽는 값, message는 사람이 읽는 설명이다. fieldErrors는 입력 검증 실패(400)일 때만 채워진다. */
public class ErrorResponse {

  private final String code;
  private final String message;

  @JsonInclude(JsonInclude.Include.NON_EMPTY)
  private final List<FieldErrorResponse> fieldErrors;

  public ErrorResponse(String code, String message) {
    this(code, message, Collections.<FieldErrorResponse>emptyList());
  }

  public ErrorResponse(String code, String message, List<FieldErrorResponse> fieldErrors) {
    this.code = code;
    this.message = message;
    this.fieldErrors = fieldErrors;
  }

  public String getCode() {
    return code;
  }

  public String getMessage() {
    return message;
  }

  public List<FieldErrorResponse> getFieldErrors() {
    return fieldErrors;
  }
}
