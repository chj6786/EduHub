package com.example.eduhub.course.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.example.eduhub.common.error.ConflictException;
import com.example.eduhub.common.error.NotFoundException;
import com.example.eduhub.course.domain.Course;
import com.example.eduhub.course.domain.CourseSession;
import com.example.eduhub.course.domain.CourseSessionStatus;
import com.example.eduhub.course.domain.CourseStatus;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;

/** 관리자 과정·회차 등록·수정·종료 (FR-03). 로컬 eduhub_test DB에서 돌고 테스트마다 롤백된다. */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(CourseCommandService.class)
class CourseCommandServiceTest {

  private static final LocalDate DAY = LocalDate.now().plusDays(10);

  @Autowired private CourseCommandService service;

  @Autowired private TestEntityManager entityManager;

  @Test
  void createCourse_savesTrimmedValuesAsOpen() {
    CourseDetailResponse created =
        service.createCourse(new CourseRequest("  JPA 기초 ", "개발", "   "));
    flushAndClear();

    Course found = entityManager.find(Course.class, created.getId());
    assertThat(found.getTitle()).isEqualTo("JPA 기초");
    assertThat(found.getDescription()).isNull();
    assertThat(found.getStatus()).isEqualTo(CourseStatus.OPEN);
    assertThat(created.getSessions()).isEmpty();
  }

  @Test
  void updateCourse_changesFields() {
    Course course = persistCourse();

    CourseDetailResponse updated =
        service.updateCourse(course.getId(), new CourseRequest("JPA 심화", "데이터", "설명"));
    flushAndClear();

    Course found = entityManager.find(Course.class, course.getId());
    assertThat(found.getTitle()).isEqualTo("JPA 심화");
    assertThat(found.getCategory()).isEqualTo("데이터");
    assertThat(found.getDescription()).isEqualTo("설명");
    assertThat(updated.getTitle()).isEqualTo("JPA 심화");
  }

  @Test
  void updateCourse_closed_throwsCourseClosed() {
    Course course = persistCourse();
    service.closeCourse(course.getId());

    assertThatThrownBy(
            () -> service.updateCourse(course.getId(), new CourseRequest("x", "개발", null)))
        .isInstanceOf(ConflictException.class)
        .extracting("code")
        .isEqualTo("COURSE_CLOSED");
  }

  @Test
  void updateCourse_unknownId_throwsNotFound() {
    assertThatThrownBy(() -> service.updateCourse(-1L, new CourseRequest("x", "개발", null)))
        .isInstanceOf(NotFoundException.class);
  }

  @Test
  void closeCourse_closesOpenSessionsToo() {
    Course course = persistCourse();
    CourseSession first = persistSession(course, DAY);
    CourseSession second = persistSession(course, DAY.plusDays(7));
    flushAndClear();

    CourseDetailResponse closed = service.closeCourse(course.getId());
    flushAndClear();

    assertThat(closed.getStatus()).isEqualTo(CourseStatus.CLOSED);
    assertThat(closed.getSessions())
        .extracting(SessionResponse::getStatus)
        .containsOnly(CourseSessionStatus.CLOSED);
    assertThat(entityManager.find(CourseSession.class, first.getId()).getStatus())
        .isEqualTo(CourseSessionStatus.CLOSED);
    assertThat(entityManager.find(CourseSession.class, second.getId()).getStatus())
        .isEqualTo(CourseSessionStatus.CLOSED);
  }

  @Test
  void closeCourse_twice_succeeds() {
    Course course = persistCourse();
    service.closeCourse(course.getId());

    assertThat(service.closeCourse(course.getId()).getStatus()).isEqualTo(CourseStatus.CLOSED);
  }

  @Test
  void createSession_savesOpenSession() {
    Course course = persistCourse();

    SessionResponse created =
        service.createSession(course.getId(), new SessionRequest(DAY, " A동 ", 30));
    flushAndClear();

    CourseSession found = entityManager.find(CourseSession.class, created.getId());
    assertThat(found.getPlace()).isEqualTo("A동");
    assertThat(found.getCapacity()).isEqualTo(30);
    assertThat(found.getStatus()).isEqualTo(CourseSessionStatus.OPEN);
    assertThat(found.getCourse().getId()).isEqualTo(course.getId());
  }

  @Test
  void createSession_closedCourse_throwsCourseClosed() {
    Course course = persistCourse();
    service.closeCourse(course.getId());

    assertThatThrownBy(
            () -> service.createSession(course.getId(), new SessionRequest(DAY, "A동", 30)))
        .isInstanceOf(ConflictException.class)
        .extracting("code")
        .isEqualTo("COURSE_CLOSED");
  }

  @Test
  void updateSession_changesFields() {
    CourseSession session = persistSession(persistCourse(), DAY);

    service.updateSession(session.getId(), new SessionRequest(DAY.plusDays(1), "B동", 50));
    flushAndClear();

    CourseSession found = entityManager.find(CourseSession.class, session.getId());
    assertThat(found.getStartDate()).isEqualTo(DAY.plusDays(1));
    assertThat(found.getPlace()).isEqualTo("B동");
    assertThat(found.getCapacity()).isEqualTo(50);
  }

  @Test
  void updateSession_closed_throwsSessionClosed() {
    CourseSession session = persistSession(persistCourse(), DAY);
    service.closeSession(session.getId());

    assertThatThrownBy(
            () -> service.updateSession(session.getId(), new SessionRequest(DAY, "B동", 50)))
        .isInstanceOf(ConflictException.class)
        .extracting("code")
        .isEqualTo("SESSION_CLOSED");
  }

  @Test
  void closeSession_unknownId_throwsNotFound() {
    assertThatThrownBy(() -> service.closeSession(-1L)).isInstanceOf(NotFoundException.class);
  }

  private Course persistCourse() {
    return entityManager.persistAndFlush(new Course("JPA 기초", "개발", null));
  }

  private CourseSession persistSession(Course course, LocalDate startDate) {
    return entityManager.persistAndFlush(new CourseSession(course, startDate, "A동", 30));
  }

  private void flushAndClear() {
    entityManager.flush();
    entityManager.clear();
  }
}
