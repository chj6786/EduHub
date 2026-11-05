package com.example.eduhub.course.application;

import com.example.eduhub.course.domain.Course;
import com.example.eduhub.course.domain.CourseStatus;
import java.util.List;

/** 과정 상세와 회차 목록 (FR-02). */
public class CourseDetailResponse {

  private final Long id;
  private final String title;
  private final String category;
  private final String description;
  private final CourseStatus status;
  private final List<SessionResponse> sessions;

  public CourseDetailResponse(
      Long id,
      String title,
      String category,
      String description,
      CourseStatus status,
      List<SessionResponse> sessions) {
    this.id = id;
    this.title = title;
    this.category = category;
    this.description = description;
    this.status = status;
    this.sessions = sessions;
  }

  static CourseDetailResponse of(Course course, List<SessionResponse> sessions) {
    return new CourseDetailResponse(
        course.getId(),
        course.getTitle(),
        course.getCategory(),
        course.getDescription(),
        course.getStatus(),
        sessions);
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

  public String getDescription() {
    return description;
  }

  public CourseStatus getStatus() {
    return status;
  }

  public List<SessionResponse> getSessions() {
    return sessions;
  }
}
