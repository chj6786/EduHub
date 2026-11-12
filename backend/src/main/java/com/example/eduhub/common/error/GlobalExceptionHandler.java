package com.example.eduhub.common.error;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/** 예외를 공통 ErrorResponse로 바꾼다. 도메인 패키지를 참조하지 않는다. */
@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(NotFoundException.class)
  @ResponseStatus(HttpStatus.NOT_FOUND)
  public ErrorResponse handleNotFound(NotFoundException e) {
    return new ErrorResponse("NOT_FOUND", e.getMessage());
  }

  @ExceptionHandler(ConflictException.class)
  @ResponseStatus(HttpStatus.CONFLICT)
  public ErrorResponse handleConflict(ConflictException e) {
    return new ErrorResponse(e.getCode(), e.getMessage());
  }

  /** @Valid 요청 본문 검증 실패. 필드별 메시지를 함께 돌려준다. */
  @ExceptionHandler(MethodArgumentNotValidException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public ErrorResponse handleValidation(MethodArgumentNotValidException e) {
    List<FieldErrorResponse> fieldErrors =
        e.getBindingResult().getFieldErrors().stream()
            .map(error -> new FieldErrorResponse(error.getField(), error.getDefaultMessage()))
            .collect(Collectors.toList());
    return new ErrorResponse("VALIDATION_ERROR", "입력값을 확인해 주세요.", fieldErrors);
  }

  /** JSON 형식 오류, 날짜·숫자 변환 실패 등 본문을 읽을 수 없는 경우. */
  @ExceptionHandler(HttpMessageNotReadableException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public ErrorResponse handleNotReadable(HttpMessageNotReadableException e) {
    return new ErrorResponse("INVALID_REQUEST", "요청 본문을 읽을 수 없습니다. 형식을 확인해 주세요.");
  }

  /** 경로 변수·쿼리 파라미터 타입 불일치(예: /courses/abc). */
  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public ErrorResponse handleTypeMismatch(MethodArgumentTypeMismatchException e) {
    return new ErrorResponse("INVALID_REQUEST", "잘못된 요청 값입니다: " + e.getName());
  }
}
