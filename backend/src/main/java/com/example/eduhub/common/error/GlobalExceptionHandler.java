package com.example.eduhub.common.error;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** 예외를 공통 ErrorResponse로 바꾼다. 도메인 패키지를 참조하지 않는다. */
@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(NotFoundException.class)
  @ResponseStatus(HttpStatus.NOT_FOUND)
  public ErrorResponse handleNotFound(NotFoundException e) {
    return new ErrorResponse("NOT_FOUND", e.getMessage());
  }
}
