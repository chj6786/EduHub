package com.example.eduhub.course.application;

import io.swagger.v3.oas.annotations.media.Schema;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

/** 과정 등록·수정 요청 (FR-03). 길이 제한은 V1 스키마 컬럼 길이에 맞춘다. */
public class CourseRequest {

  @Schema(description = "과정명", example = "JPA 기초", required = true, maxLength = 200)
  @NotBlank(message = "과정명을 입력해 주세요.")
  @Size(max = 200, message = "과정명은 200자 이하로 입력해 주세요.")
  private String title;

  @Schema(description = "분류", example = "개발", required = true, maxLength = 50)
  @NotBlank(message = "분류를 입력해 주세요.")
  @Size(max = 50, message = "분류는 50자 이하로 입력해 주세요.")
  private String category;

  @Schema(description = "설명 (선택)", example = "엔티티와 영속성 컨텍스트", maxLength = 2000)
  @Size(max = 2000, message = "설명은 2000자 이하로 입력해 주세요.")
  private String description;

  public CourseRequest() {}

  public CourseRequest(String title, String category, String description) {
    this.title = title;
    this.category = category;
    this.description = description;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getCategory() {
    return category;
  }

  public void setCategory(String category) {
    this.category = category;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }
}
