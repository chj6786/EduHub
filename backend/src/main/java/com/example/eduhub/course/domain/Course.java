package com.example.eduhub.course.domain;

import com.example.eduhub.common.error.ConflictException;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

/** 교육과정 (FR-01~03). 상태는 setter 없이 close() 같은 메서드로만 바꾼다. */
@Entity
@Table(name = "course")
public class Course {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 200)
  private String title;

  @Column(nullable = false, length = 50)
  private String category;

  @Column(columnDefinition = "text")
  private String description;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private CourseStatus status;

  protected Course() {}

  public Course(String title, String category, String description) {
    this.title = title;
    this.category = category;
    this.description = description;
    this.status = CourseStatus.OPEN;
  }

  /** 제목·분류·설명을 바꾼다. 종료된 과정은 바꿀 수 없다 (FR-03). */
  public void update(String title, String category, String description) {
    ensureOpen();
    this.title = title;
    this.category = category;
    this.description = description;
  }

  /** 과정을 종료한다. 이미 종료됐으면 아무것도 하지 않는다 (FR-03). 회차 종료는 서비스가 함께 처리한다(D-03). */
  public void close() {
    this.status = CourseStatus.CLOSED;
  }

  public boolean isClosed() {
    return status == CourseStatus.CLOSED;
  }

  /** 종료된 과정이면 COURSE_CLOSED(409). 수정과 회차 등록 전에 확인한다 (FR-03). */
  public void ensureOpen() {
    if (isClosed()) {
      throw new ConflictException("COURSE_CLOSED", "종료된 과정입니다. id=" + id);
    }
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
}
