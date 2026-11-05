package com.example.eduhub.course.domain;

import java.util.Locale;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

/**
 * 과정 검색 조건 (FR-01). 값이 비어 있으면 null을 돌려줘 조건을 붙이지 않는다.
 *
 * <p>JPQL에 null 파라미터를 넘기면 Hibernate 5 + PostgreSQL에서 타입 추론 오류가 날 수 있어, 있는 조건만 조립한다.
 */
public final class CourseSpecifications {

  private static final char LIKE_ESCAPE = '\\';

  private CourseSpecifications() {}

  /** 제목 부분 일치, 대소문자 무시. */
  public static Specification<Course> titleContains(String keyword) {
    if (!StringUtils.hasText(keyword)) {
      return null;
    }
    String pattern = "%" + escapeLike(keyword.trim().toLowerCase(Locale.ROOT)) + "%";
    return (root, query, cb) -> cb.like(cb.lower(root.get("title")), pattern, LIKE_ESCAPE);
  }

  /** 분류 정확히 일치. */
  public static Specification<Course> categoryEquals(String category) {
    if (!StringUtils.hasText(category)) {
      return null;
    }
    String value = category.trim();
    return (root, query, cb) -> cb.equal(root.get("category"), value);
  }

  /** 사용자가 입력한 %, _ 를 와일드카드가 아닌 글자로 검색하게 한다. */
  private static String escapeLike(String value) {
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
  }
}
