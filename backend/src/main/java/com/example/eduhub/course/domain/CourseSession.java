package com.example.eduhub.course.domain;

import com.example.eduhub.common.error.ConflictException;
import java.time.LocalDate;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

/** 과정의 회차: 일정, 장소, 정원 (FR-02, FR-03). 상태는 setter 없이 close() 같은 메서드로만 바꾼다. */
@Entity
@Table(name = "course_session")
public class CourseSession {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "course_id", nullable = false)
  private Course course;

  @Column(name = "start_date", nullable = false)
  private LocalDate startDate;

  @Column(nullable = false, length = 200)
  private String place;

  @Column(nullable = false)
  private int capacity;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private CourseSessionStatus status;

  protected CourseSession() {}

  public CourseSession(Course course, LocalDate startDate, String place, int capacity) {
    this.course = course;
    this.startDate = startDate;
    this.place = place;
    this.capacity = capacity;
    this.status = CourseSessionStatus.OPEN;
  }

  /**
   * 일정·장소·정원을 바꾼다. 종료된 회차는 바꿀 수 없다 (FR-03).
   *
   * <p>TODO(FR-04): 수강 신청이 생기면 정원을 확정 인원보다 작게 줄이지 못하게 막는다.
   */
  public void update(LocalDate startDate, String place, int capacity) {
    if (status == CourseSessionStatus.CLOSED) {
      throw new ConflictException("SESSION_CLOSED", "종료된 회차입니다. id=" + id);
    }
    this.startDate = startDate;
    this.place = place;
    this.capacity = capacity;
  }

  /** 회차를 종료한다. 이미 종료됐으면 아무것도 하지 않는다 (FR-03). */
  public void close() {
    this.status = CourseSessionStatus.CLOSED;
  }

  public Long getId() {
    return id;
  }

  public Course getCourse() {
    return course;
  }

  public LocalDate getStartDate() {
    return startDate;
  }

  public String getPlace() {
    return place;
  }

  public int getCapacity() {
    return capacity;
  }

  public CourseSessionStatus getStatus() {
    return status;
  }
}
