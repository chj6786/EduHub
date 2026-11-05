package com.example.eduhub.course.api;

import com.example.eduhub.common.api.PageResponse;
import com.example.eduhub.common.error.ErrorResponse;
import com.example.eduhub.course.application.CourseDetailResponse;
import com.example.eduhub.course.application.CourseQueryService;
import com.example.eduhub.course.application.CourseSummaryResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springdoc.api.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Course", description = "교육과정 조회")
@RestController
@RequestMapping("/api/v1/courses")
public class CourseController {

  private final CourseQueryService courseQueryService;

  public CourseController(CourseQueryService courseQueryService) {
    this.courseQueryService = courseQueryService;
  }

  @Operation(summary = "과정 목록 조회 (제목 keyword, category 필터, 페이지)")
  @GetMapping
  public PageResponse<CourseSummaryResponse> list(
      @Parameter(description = "제목 검색어 (부분 일치, 대소문자 무시)") @RequestParam(required = false)
          String keyword,
      @Parameter(description = "분류 (정확히 일치)") @RequestParam(required = false) String category,
      @ParameterObject @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC)
          Pageable pageable) {
    return courseQueryService.search(keyword, category, pageable);
  }

  @Operation(summary = "과정 상세 조회 (회차 목록, 남은 자리 포함)")
  @ApiResponse(responseCode = "200", description = "조회 성공")
  @ApiResponse(
      responseCode = "404",
      description = "과정이 없음",
      content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  @GetMapping("/{id}")
  public CourseDetailResponse detail(@PathVariable Long id) {
    return courseQueryService.getDetail(id);
  }
}
