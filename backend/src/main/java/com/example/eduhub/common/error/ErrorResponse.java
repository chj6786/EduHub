package com.example.eduhub.common.error;

/** 공통 에러 응답. code는 기계가 읽는 값, message는 사람이 읽는 설명이다. */
public class ErrorResponse {

  private final String code;
  private final String message;

  public ErrorResponse(String code, String message) {
    this.code = code;
    this.message = message;
  }

  public String getCode() {
    return code;
  }

  public String getMessage() {
    return message;
  }
}
