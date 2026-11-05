package com.example.eduhub.course.domain;

import static com.example.eduhub.course.domain.CourseSpecifications.categoryEquals;
import static com.example.eduhub.course.domain.CourseSpecifications.titleContains;
import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

/** 과정 검색 조건(FR-01)과 회차 조회(FR-02). 로컬 eduhub_test DB에서 돌고 테스트마다 롤백된다. */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class CourseSearchTest {

  @Autowired private CourseRepository courseRepository;

  @Autowired private CourseSessionRepository courseSessionRepository;

  @Autowired private TestEntityManager entityManager;

  private Course jpaBasics;

  @BeforeEach
  void setUp() {
    jpaBasics = courseRepository.save(new Course("JPA 기초", "개발", null));
    courseRepository.save(new Course("실전 jpa 성능", "개발", null));
    courseRepository.save(new Course("JPA로 보는 데이터 모델링", "데이터", null));
    courseRepository.save(new Course("리더십 101", "리더십", null));
    entityManager.flush();
    entityManager.clear();
  }

  @Test
  void noCondition_returnsAll() {
    Page<Course> page = search(null, null, 0, 20);

    assertThat(page.getTotalElements()).isEqualTo(4);
  }

  @Test
  void keyword_matchesTitlePartiallyIgnoringCase() {
    Page<Course> page = search("jpa", null, 0, 20);

    assertThat(titles(page)).containsExactlyInAnyOrder("JPA 기초", "실전 jpa 성능", "JPA로 보는 데이터 모델링");
  }

  @Test
  void category_matchesExactly() {
    Page<Course> page = search(null, "개발", 0, 20);

    assertThat(titles(page)).containsExactlyInAnyOrder("JPA 기초", "실전 jpa 성능");
  }

  @Test
  void keywordAndCategory_matchBoth() {
    Page<Course> page = search("JPA", "데이터", 0, 20);

    assertThat(titles(page)).containsExactly("JPA로 보는 데이터 모델링");
  }

  @Test
  void blankConditions_areIgnored() {
    Page<Course> page = search("  ", "", 0, 20);

    assertThat(page.getTotalElements()).isEqualTo(4);
  }

  @Test
  void paging_returnsRequestedSizeAndTotal() {
    Page<Course> page = search(null, null, 0, 3);

    assertThat(page.getContent()).hasSize(3);
    assertThat(page.getTotalElements()).isEqualTo(4);
    assertThat(page.getTotalPages()).isEqualTo(2);
  }

  @Test
  void sessions_areFoundByCourseInStartDateOrder() {
    Course course = entityManager.find(Course.class, jpaBasics.getId());
    Course other = courseRepository.save(new Course("다른 과정", "개발", null));
    courseSessionRepository.save(new CourseSession(course, LocalDate.of(2026, 12, 10), "B동", 20));
    courseSessionRepository.save(new CourseSession(course, LocalDate.of(2026, 12, 1), "A동", 30));
    courseSessionRepository.save(new CourseSession(other, LocalDate.of(2026, 11, 1), "C동", 10));
    entityManager.flush();
    entityManager.clear();

    List<CourseSession> sessions =
        courseSessionRepository.findByCourseIdOrderByStartDateAsc(course.getId());

    assertThat(sessions)
        .extracting(CourseSession::getStartDate)
        .containsExactly(LocalDate.of(2026, 12, 1), LocalDate.of(2026, 12, 10));
  }

  private Page<Course> search(String keyword, String category, int page, int size) {
    Specification<Course> spec =
        Specification.where(titleContains(keyword)).and(categoryEquals(category));
    return courseRepository.findAll(spec, PageRequest.of(page, size, Sort.by("id")));
  }

  private static List<String> titles(Page<Course> page) {
    return page.map(Course::getTitle).getContent();
  }
}
