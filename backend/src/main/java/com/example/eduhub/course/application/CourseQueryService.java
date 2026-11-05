package com.example.eduhub.course.application;

import static com.example.eduhub.course.domain.CourseSpecifications.categoryEquals;
import static com.example.eduhub.course.domain.CourseSpecifications.titleContains;

import com.example.eduhub.common.api.PageResponse;
import com.example.eduhub.common.error.NotFoundException;
import com.example.eduhub.course.domain.Course;
import com.example.eduhub.course.domain.CourseRepository;
import com.example.eduhub.course.domain.CourseSessionRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 과정 조회 (FR-01, FR-02). 엔티티는 이 트랜잭션 안에서 DTO로 바꿔 내보낸다(open-in-view=false). */
@Service
@Transactional(readOnly = true)
public class CourseQueryService {

  private final CourseRepository courseRepository;
  private final CourseSessionRepository courseSessionRepository;

  public CourseQueryService(
      CourseRepository courseRepository, CourseSessionRepository courseSessionRepository) {
    this.courseRepository = courseRepository;
    this.courseSessionRepository = courseSessionRepository;
  }

  /** 제목 keyword(부분 일치)와 category(정확히 일치)로 검색한다. 둘 다 비어 있으면 전체를 조회한다 (FR-01). */
  public PageResponse<CourseSummaryResponse> search(
      String keyword, String category, Pageable pageable) {
    Specification<Course> spec =
        Specification.where(titleContains(keyword)).and(categoryEquals(category));
    return PageResponse.from(
        courseRepository.findAll(spec, pageable).map(CourseSummaryResponse::from));
  }

  /** 과정 상세와 회차 목록을 조회한다. 없는 id면 NotFoundException (FR-02). */
  public CourseDetailResponse getDetail(Long courseId) {
    Course course =
        courseRepository
            .findById(courseId)
            .orElseThrow(() -> new NotFoundException("과정을 찾을 수 없습니다. id=" + courseId));
    List<SessionResponse> sessions =
        courseSessionRepository.findByCourseIdOrderByStartDateAsc(courseId).stream()
            .map(SessionResponse::from)
            .collect(Collectors.toList());
    return CourseDetailResponse.of(course, sessions);
  }
}
