package com.example.eduhub.course.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.eduhub.common.api.PageResponse;
import com.example.eduhub.common.error.NotFoundException;
import com.example.eduhub.course.application.CourseDetailResponse;
import com.example.eduhub.course.application.CourseQueryService;
import com.example.eduhub.course.application.CourseSummaryResponse;
import com.example.eduhub.course.application.SessionResponse;
import com.example.eduhub.course.domain.CourseSessionStatus;
import com.example.eduhub.course.domain.CourseStatus;
import java.time.LocalDate;
import java.util.Collections;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(CourseController.class)
class CourseControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private CourseQueryService courseQueryService;

  @Test
  void list_returnsPage() throws Exception {
    CourseSummaryResponse course = new CourseSummaryResponse(1L, "JPA 기초", "개발", CourseStatus.OPEN);
    given(courseQueryService.search(any(), any(), any(Pageable.class)))
        .willReturn(new PageResponse<>(Collections.singletonList(course), 0, 20, 1L));

    mockMvc
        .perform(get("/api/v1/courses"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content[0].id").value(1))
        .andExpect(jsonPath("$.content[0].title").value("JPA 기초"))
        .andExpect(jsonPath("$.content[0].status").value("OPEN"))
        .andExpect(jsonPath("$.page").value(0))
        .andExpect(jsonPath("$.size").value(20))
        .andExpect(jsonPath("$.totalElements").value(1));
  }

  @Test
  void list_passesSearchConditionsAndPage() throws Exception {
    given(courseQueryService.search(any(), any(), any(Pageable.class)))
        .willReturn(new PageResponse<>(Collections.emptyList(), 1, 5, 0L));

    mockMvc
        .perform(
            get("/api/v1/courses")
                .param("keyword", "jpa")
                .param("category", "개발")
                .param("page", "1")
                .param("size", "5"))
        .andExpect(status().isOk());

    ArgumentCaptor<Pageable> pageable = ArgumentCaptor.forClass(Pageable.class);
    verify(courseQueryService).search(eq("jpa"), eq("개발"), pageable.capture());
    assertThat(pageable.getValue().getPageNumber()).isEqualTo(1);
    assertThat(pageable.getValue().getPageSize()).isEqualTo(5);
  }

  @Test
  void list_withoutParams_usesDefaultPageAndSort() throws Exception {
    given(courseQueryService.search(any(), any(), any(Pageable.class)))
        .willReturn(new PageResponse<>(Collections.emptyList(), 0, 20, 0L));

    mockMvc.perform(get("/api/v1/courses")).andExpect(status().isOk());

    ArgumentCaptor<Pageable> pageable = ArgumentCaptor.forClass(Pageable.class);
    verify(courseQueryService).search(isNull(), isNull(), pageable.capture());
    assertThat(pageable.getValue().getPageNumber()).isEqualTo(0);
    assertThat(pageable.getValue().getPageSize()).isEqualTo(20);
    assertThat(pageable.getValue().getSort().getOrderFor("id").getDirection())
        .isEqualTo(Sort.Direction.DESC);
  }

  @Test
  void detail_returnsCourseWithSessions() throws Exception {
    SessionResponse session =
        new SessionResponse(
            10L, LocalDate.of(2026, 12, 1), "본사 3층 교육장", 30, 30, CourseSessionStatus.OPEN);
    given(courseQueryService.getDetail(1L))
        .willReturn(
            new CourseDetailResponse(
                1L,
                "JPA 기초",
                "개발",
                "엔티티와 영속성 컨텍스트",
                CourseStatus.OPEN,
                Collections.singletonList(session)));

    mockMvc
        .perform(get("/api/v1/courses/1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(1))
        .andExpect(jsonPath("$.description").value("엔티티와 영속성 컨텍스트"))
        .andExpect(jsonPath("$.sessions[0].startDate").value("2026-12-01"))
        .andExpect(jsonPath("$.sessions[0].place").value("본사 3층 교육장"))
        .andExpect(jsonPath("$.sessions[0].capacity").value(30))
        .andExpect(jsonPath("$.sessions[0].remainingSeats").value(30));
  }

  @Test
  void detail_unknownId_returns404() throws Exception {
    given(courseQueryService.getDetail(999L))
        .willThrow(new NotFoundException("과정을 찾을 수 없습니다. id=999"));

    mockMvc
        .perform(get("/api/v1/courses/999"))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("NOT_FOUND"))
        .andExpect(jsonPath("$.message").value("과정을 찾을 수 없습니다. id=999"));
  }
}
