package com.example.eduhub.course.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

/**
 * 로컬 PostgreSQL의 eduhub_test DB(test 프로필)에서 Flyway V1을 적용하고, ddl-auto=validate로 엔티티와 스키마가 일치하는지 함께
 * 확인한다. 각 테스트는 끝나면 롤백된다.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class CourseRepositoryTest {

  @Autowired private CourseRepository courseRepository;

  @Autowired private TestEntityManager entityManager;

  @Test
  void saveAndFindById() {
    Course saved = courseRepository.save(new Course("JPA 기초", "개발", "엔티티와 영속성 컨텍스트"));
    entityManager.flush();
    entityManager.clear();

    Course found = courseRepository.findById(saved.getId()).orElseThrow(IllegalStateException::new);

    assertThat(found.getTitle()).isEqualTo("JPA 기초");
    assertThat(found.getCategory()).isEqualTo("개발");
    assertThat(found.getDescription()).isEqualTo("엔티티와 영속성 컨텍스트");
    assertThat(found.getStatus()).isEqualTo(CourseStatus.OPEN);
  }
}
