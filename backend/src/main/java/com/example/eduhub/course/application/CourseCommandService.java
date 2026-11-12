package com.example.eduhub.course.application;

import com.example.eduhub.common.error.NotFoundException;
import com.example.eduhub.course.domain.Course;
import com.example.eduhub.course.domain.CourseRepository;
import com.example.eduhub.course.domain.CourseSession;
import com.example.eduhub.course.domain.CourseSessionRepository;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * 관리자의 과정·회차 등록·수정·종료 (FR-03). 상태 규칙은 엔티티 메서드(update, close, ensureOpen)가 지킨다.
 *
 * <p>입력 형식 검증은 컨트롤러의 @Valid가 맡고, 여기서는 앞뒤 공백만 정리한다.
 */
@Service
@Transactional
public class CourseCommandService {

  private final CourseRepository courseRepository;
  private final CourseSessionRepository courseSessionRepository;

  public CourseCommandService(
      CourseRepository courseRepository, CourseSessionRepository courseSessionRepository) {
    this.courseRepository = courseRepository;
    this.courseSessionRepository = courseSessionRepository;
  }

  public CourseDetailResponse createCourse(CourseRequest request) {
    Course course =
        courseRepository.save(
            new Course(
                request.getTitle().trim(),
                request.getCategory().trim(),
                normalize(request.getDescription())));
    return CourseDetailResponse.of(course, Collections.<SessionResponse>emptyList());
  }

  /** 종료된 과정이면 COURSE_CLOSED(409). */
  public CourseDetailResponse updateCourse(Long courseId, CourseRequest request) {
    Course course = findCourse(courseId);
    course.update(
        request.getTitle().trim(),
        request.getCategory().trim(),
        normalize(request.getDescription()));
    return CourseDetailResponse.of(
        course, toResponses(courseSessionRepository.findByCourseIdOrderByStartDateAsc(courseId)));
  }

  /** 과정과 그 과정의 운영 중인 회차를 함께 종료한다(D-03). 이미 종료됐어도 성공으로 본다. */
  public CourseDetailResponse closeCourse(Long courseId) {
    Course course = findCourse(courseId);
    course.close();
    List<CourseSession> sessions =
        courseSessionRepository.findByCourseIdOrderByStartDateAsc(courseId);
    sessions.forEach(CourseSession::close);
    return CourseDetailResponse.of(course, toResponses(sessions));
  }

  /** 종료된 과정에는 회차를 등록할 수 없다(COURSE_CLOSED, 409). */
  public SessionResponse createSession(Long courseId, SessionRequest request) {
    Course course = findCourse(courseId);
    course.ensureOpen();
    CourseSession session =
        courseSessionRepository.save(
            new CourseSession(
                course, request.getStartDate(), request.getPlace().trim(), request.getCapacity()));
    return SessionResponse.from(session);
  }

  /** 종료된 회차면 SESSION_CLOSED(409). */
  public SessionResponse updateSession(Long sessionId, SessionRequest request) {
    CourseSession session = findSession(sessionId);
    session.update(request.getStartDate(), request.getPlace().trim(), request.getCapacity());
    return SessionResponse.from(session);
  }

  /** 이미 종료됐어도 성공으로 본다. */
  public SessionResponse closeSession(Long sessionId) {
    CourseSession session = findSession(sessionId);
    session.close();
    return SessionResponse.from(session);
  }

  private Course findCourse(Long courseId) {
    return courseRepository
        .findById(courseId)
        .orElseThrow(() -> new NotFoundException("과정을 찾을 수 없습니다. id=" + courseId));
  }

  private CourseSession findSession(Long sessionId) {
    return courseSessionRepository
        .findById(sessionId)
        .orElseThrow(() -> new NotFoundException("회차를 찾을 수 없습니다. id=" + sessionId));
  }

  private static List<SessionResponse> toResponses(List<CourseSession> sessions) {
    return sessions.stream().map(SessionResponse::from).collect(Collectors.toList());
  }

  /** 빈 설명은 null로 저장한다. */
  private static String normalize(String value) {
    return StringUtils.hasText(value) ? value.trim() : null;
  }
}
