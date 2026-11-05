package com.example.eduhub.course.application;

import com.example.eduhub.course.domain.Course;
import com.example.eduhub.course.domain.CourseStatus;

/** 과정 목록 항목 (FR-01). */
public class CourseSummaryResponse {

  private final Long id;
  private final String title;
  private final String category;
  private final CourseStatus status;

  public CourseSummaryResponse(Long id, String title, String category, CourseStatus status) {
    this.id = id;
    this.title = title;
    this.category = category;
    this.status = status;
  }

  static CourseSummaryResponse from(Course course) {
    return new CourseSummaryResponse(
        course.getId(), course.getTitle(), course.getCategory(), course.getStatus());
  }

  public Long getId() {
    return id;
  }

  public String getTitle() {
    return title;
  }

  public String getCategory() {
    return category;
  }

  public CourseStatus getStatus() {
    return status;
  }
}
