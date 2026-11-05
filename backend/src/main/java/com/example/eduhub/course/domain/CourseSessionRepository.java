package com.example.eduhub.course.domain;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseSessionRepository extends JpaRepository<CourseSession, Long> {

  /** 과정의 회차를 시작일 순으로 조회한다 (FR-02). */
  List<CourseSession> findByCourseIdOrderByStartDateAsc(Long courseId);
}
