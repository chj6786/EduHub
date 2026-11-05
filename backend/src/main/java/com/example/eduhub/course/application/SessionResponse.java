package com.example.eduhub.course.application;

import com.example.eduhub.course.domain.CourseSession;
import com.example.eduhub.course.domain.CourseSessionStatus;
import java.time.LocalDate;

/** 과정 상세의 회차 (FR-02). */
public class SessionResponse {

  private final Long id;
  private final LocalDate startDate;
  private final String place;
  private final int capacity;
  private final int remainingSeats;
  private final CourseSessionStatus status;

  public SessionResponse(
      Long id,
      LocalDate startDate,
      String place,
      int capacity,
      int remainingSeats,
      CourseSessionStatus status) {
    this.id = id;
    this.startDate = startDate;
    this.place = place;
    this.capacity = capacity;
    this.remainingSeats = remainingSeats;
    this.status = status;
  }

  static SessionResponse from(CourseSession session) {
    // 수강 신청(3주차) 전이라 남은 자리는 정원과 같다.
    return new SessionResponse(
        session.getId(),
        session.getStartDate(),
        session.getPlace(),
        session.getCapacity(),
        session.getCapacity(),
        session.getStatus());
  }

  public Long getId() {
    return id;
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

  public int getRemainingSeats() {
    return remainingSeats;
  }

  public CourseSessionStatus getStatus() {
    return status;
  }
}
