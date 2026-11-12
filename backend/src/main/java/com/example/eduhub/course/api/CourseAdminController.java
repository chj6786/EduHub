package com.example.eduhub.course.api;

import com.example.eduhub.common.error.ErrorResponse;
import com.example.eduhub.course.application.CourseCommandService;
import com.example.eduhub.course.application.CourseDetailResponse;
import com.example.eduhub.course.application.CourseRequest;
import com.example.eduhub.course.application.SessionRequest;
import com.example.eduhub.course.application.SessionResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.net.URI;
import javax.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 관리자의 과정·회차 등록·수정·종료 (FR-03). 목록·상세 조회는 CourseController(/api/v1/courses)를 함께 쓴다.
 *
 * <p>TODO(NFR-03): 인증이 생기면 /api/v1/admin/** 전체에 관리자 권한 검사를 건다. 지금은 검사하지 않는다(D-01).
 */
@Tag(name = "Course Admin", description = "관리자 과정·회차 관리 (권한 검사 미적용: 인증 도입 시 추가)")
@RestController
@RequestMapping("/api/v1/admin")
@ApiResponse(
    responseCode = "400",
    description = "입력값 오류 (VALIDATION_ERROR, INVALID_REQUEST)",
    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
@ApiResponse(
    responseCode = "404",
    description = "과정 또는 회차가 없음 (NOT_FOUND)",
    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
public class CourseAdminController {

  private final CourseCommandService courseCommandService;

  public CourseAdminController(CourseCommandService courseCommandService) {
    this.courseCommandService = courseCommandService;
  }

  @Operation(summary = "과정 등록")
  @ApiResponse(responseCode = "201", description = "등록됨")
  @PostMapping("/courses")
  public ResponseEntity<CourseDetailResponse> createCourse(
      @Valid @RequestBody CourseRequest request) {
    CourseDetailResponse created = courseCommandService.createCourse(request);
    return ResponseEntity.created(URI.create("/api/v1/courses/" + created.getId())).body(created);
  }

  @Operation(summary = "과정 수정 (종료된 과정은 수정할 수 없음)")
  @ApiResponse(responseCode = "200", description = "수정됨")
  @ApiResponse(
      responseCode = "409",
      description = "종료된 과정 (COURSE_CLOSED)",
      content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  @PutMapping("/courses/{courseId}")
  public CourseDetailResponse updateCourse(
      @PathVariable Long courseId, @Valid @RequestBody CourseRequest request) {
    return courseCommandService.updateCourse(courseId, request);
  }

  @Operation(summary = "과정 종료 (운영 중인 회차도 함께 종료, 이미 종료됐어도 성공)")
  @ApiResponse(responseCode = "200", description = "종료됨")
  @PostMapping("/courses/{courseId}/close")
  public CourseDetailResponse closeCourse(@PathVariable Long courseId) {
    return courseCommandService.closeCourse(courseId);
  }

  @Operation(summary = "회차 등록 (종료된 과정에는 등록할 수 없음)")
  @ApiResponse(responseCode = "201", description = "등록됨")
  @ApiResponse(
      responseCode = "409",
      description = "종료된 과정 (COURSE_CLOSED)",
      content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  @PostMapping("/courses/{courseId}/sessions")
  public ResponseEntity<SessionResponse> createSession(
      @PathVariable Long courseId, @Valid @RequestBody SessionRequest request) {
    SessionResponse created = courseCommandService.createSession(courseId, request);
    return ResponseEntity.created(URI.create("/api/v1/courses/" + courseId)).body(created);
  }

  @Operation(summary = "회차 수정 (종료된 회차는 수정할 수 없음)")
  @ApiResponse(responseCode = "200", description = "수정됨")
  @ApiResponse(
      responseCode = "409",
      description = "종료된 회차 (SESSION_CLOSED)",
      content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  @PutMapping("/sessions/{sessionId}")
  public SessionResponse updateSession(
      @PathVariable Long sessionId, @Valid @RequestBody SessionRequest request) {
    return courseCommandService.updateSession(sessionId, request);
  }

  @Operation(summary = "회차 종료 (이미 종료됐어도 성공)")
  @ApiResponse(responseCode = "200", description = "종료됨")
  @PostMapping("/sessions/{sessionId}/close")
  public SessionResponse closeSession(@PathVariable Long sessionId) {
    return courseCommandService.closeSession(sessionId);
  }
}
