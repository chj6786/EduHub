package com.example.eduhub.course.application;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import javax.validation.constraints.FutureOrPresent;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/** 회차 등록·수정 요청 (FR-03). 시작일은 오늘 이후만 받는다(D-04). */
public class SessionRequest {

  @Schema(description = "시작일 (오늘 이후)", example = "2026-12-01", required = true)
  @NotNull(message = "시작일을 입력해 주세요.")
  @FutureOrPresent(message = "시작일은 오늘 이후여야 합니다.")
  private LocalDate startDate;

  @Schema(description = "장소", example = "본사 3층 교육장", required = true, maxLength = 200)
  @NotBlank(message = "장소를 입력해 주세요.")
  @Size(max = 200, message = "장소는 200자 이하로 입력해 주세요.")
  private String place;

  @Schema(
      description = "정원 (1~1000)",
      example = "30",
      required = true,
      minimum = "1",
      maximum = "1000")
  @NotNull(message = "정원을 입력해 주세요.")
  @Min(value = 1, message = "정원은 1명 이상이어야 합니다.")
  @Max(value = 1000, message = "정원은 1000명 이하여야 합니다.")
  private Integer capacity;

  public SessionRequest() {}

  public SessionRequest(LocalDate startDate, String place, Integer capacity) {
    this.startDate = startDate;
    this.place = place;
    this.capacity = capacity;
  }

  public LocalDate getStartDate() {
    return startDate;
  }

  public void setStartDate(LocalDate startDate) {
    this.startDate = startDate;
  }

  public String getPlace() {
    return place;
  }

  public void setPlace(String place) {
    this.place = place;
  }

  public Integer getCapacity() {
    return capacity;
  }

  public void setCapacity(Integer capacity) {
    this.capacity = capacity;
  }
}
