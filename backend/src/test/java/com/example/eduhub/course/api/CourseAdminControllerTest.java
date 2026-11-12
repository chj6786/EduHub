package com.example.eduhub.course.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.eduhub.common.error.ConflictException;
import com.example.eduhub.common.error.NotFoundException;
import com.example.eduhub.course.application.CourseCommandService;
import com.example.eduhub.course.application.CourseDetailResponse;
import com.example.eduhub.course.application.CourseRequest;
import com.example.eduhub.course.application.SessionRequest;
import com.example.eduhub.course.application.SessionResponse;
import com.example.eduhub.course.domain.CourseSessionStatus;
import com.example.eduhub.course.domain.CourseStatus;
import java.time.LocalDate;
import java.util.Collections;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/** 관리자 API의 요청 검증(400), 상태 오류(409), 없는 리소스(404) 변환 (FR-03). DB 없이 돈다. */
@WebMvcTest(CourseAdminController.class)
class CourseAdminControllerTest {

  private static final String FUTURE_DATE = LocalDate.now().plusDays(30).toString();

  @Autowired private MockMvc mockMvc;

  @MockBean private CourseCommandService courseCommandService;

  @Test
  void createCourse_returns201WithLocation() throws Exception {
    given(courseCommandService.createCourse(any(CourseRequest.class)))
        .willReturn(
            new CourseDetailResponse(
                7L,
                "JPA 기초",
                "개발",
                null,
                CourseStatus.OPEN,
                Collections.<SessionResponse>emptyList()));

    mockMvc
        .perform(
            post("/api/v1/admin/courses")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"JPA 기초\",\"category\":\"개발\"}"))
        .andExpect(status().isCreated())
        .andExpect(header().string("Location", "/api/v1/courses/7"))
        .andExpect(jsonPath("$.id").value(7))
        .andExpect(jsonPath("$.status").value("OPEN"));
  }

  @Test
  void createCourse_blankTitle_returns400WithFieldErrors() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/admin/courses")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"  \",\"category\":\"개발\"}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
        .andExpect(jsonPath("$.fieldErrors[0].field").value("title"))
        .andExpect(jsonPath("$.fieldErrors[0].message").value("과정명을 입력해 주세요."));

    verifyNoInteractions(courseCommandService);
  }

  @Test
  void createCourse_tooLongCategory_returns400() throws Exception {
    StringBuilder category = new StringBuilder();
    for (int i = 0; i < 51; i++) {
      category.append('가');
    }

    mockMvc
        .perform(
            post("/api/v1/admin/courses")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"JPA\",\"category\":\"" + category + "\"}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.fieldErrors[0].field").value("category"));
  }

  @Test
  void createCourse_malformedJson_returns400InvalidRequest() throws Exception {
    mockMvc
        .perform(post("/api/v1/admin/courses").contentType(MediaType.APPLICATION_JSON).content("{"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("INVALID_REQUEST"));
  }

  @Test
  void updateCourse_closed_returns409() throws Exception {
    given(courseCommandService.updateCourse(eq(1L), any(CourseRequest.class)))
        .willThrow(new ConflictException("COURSE_CLOSED", "종료된 과정입니다. id=1"));

    mockMvc
        .perform(
            put("/api/v1/admin/courses/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"JPA\",\"category\":\"개발\"}"))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.code").value("COURSE_CLOSED"))
        .andExpect(jsonPath("$.fieldErrors").doesNotExist());
  }

  @Test
  void closeCourse_unknownId_returns404() throws Exception {
    given(courseCommandService.closeCourse(999L))
        .willThrow(new NotFoundException("과정을 찾을 수 없습니다. id=999"));

    mockMvc
        .perform(post("/api/v1/admin/courses/999/close"))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("NOT_FOUND"));
  }

  @Test
  void closeCourse_nonNumericId_returns400() throws Exception {
    mockMvc
        .perform(post("/api/v1/admin/courses/abc/close"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("INVALID_REQUEST"));
  }

  @Test
  void createSession_returns201() throws Exception {
    given(courseCommandService.createSession(eq(1L), any(SessionRequest.class)))
        .willReturn(
            new SessionResponse(
                10L, LocalDate.parse(FUTURE_DATE), "A동", 30, 30, CourseSessionStatus.OPEN));

    mockMvc
        .perform(
            post("/api/v1/admin/courses/1/sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(sessionJson(FUTURE_DATE, "A동", "30")))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value(10))
        .andExpect(jsonPath("$.startDate").value(FUTURE_DATE));
  }

  @Test
  void createSession_pastDate_returns400() throws Exception {
    String yesterday = LocalDate.now().minusDays(1).toString();

    mockMvc
        .perform(
            post("/api/v1/admin/courses/1/sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(sessionJson(yesterday, "A동", "30")))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.fieldErrors[0].field").value("startDate"))
        .andExpect(jsonPath("$.fieldErrors[0].message").value("시작일은 오늘 이후여야 합니다."));
  }

  @Test
  void createSession_zeroCapacity_returns400() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/admin/courses/1/sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(sessionJson(FUTURE_DATE, "A동", "0")))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.fieldErrors[0].field").value("capacity"));
  }

  @Test
  void createSession_invalidDateFormat_returns400InvalidRequest() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/admin/courses/1/sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(sessionJson("2026/12/01", "A동", "30")))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("INVALID_REQUEST"));
  }

  @Test
  void createSession_closedCourse_returns409() throws Exception {
    given(courseCommandService.createSession(eq(1L), any(SessionRequest.class)))
        .willThrow(new ConflictException("COURSE_CLOSED", "종료된 과정입니다. id=1"));

    mockMvc
        .perform(
            post("/api/v1/admin/courses/1/sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(sessionJson(FUTURE_DATE, "A동", "30")))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.code").value("COURSE_CLOSED"));
  }

  @Test
  void updateSession_closed_returns409() throws Exception {
    given(courseCommandService.updateSession(eq(10L), any(SessionRequest.class)))
        .willThrow(new ConflictException("SESSION_CLOSED", "종료된 회차입니다. id=10"));

    mockMvc
        .perform(
            put("/api/v1/admin/sessions/10")
                .contentType(MediaType.APPLICATION_JSON)
                .content(sessionJson(FUTURE_DATE, "A동", "30")))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.code").value("SESSION_CLOSED"));
  }

  @Test
  void closeSession_returns200() throws Exception {
    given(courseCommandService.closeSession(10L))
        .willReturn(
            new SessionResponse(
                10L, LocalDate.parse(FUTURE_DATE), "A동", 30, 30, CourseSessionStatus.CLOSED));

    mockMvc
        .perform(post("/api/v1/admin/sessions/10/close"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("CLOSED"));
  }

  private static String sessionJson(String startDate, String place, String capacity) {
    return "{\"startDate\":\""
        + startDate
        + "\",\"place\":\""
        + place
        + "\",\"capacity\":"
        + capacity
        + "}";
  }
}
