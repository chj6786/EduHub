package com.example.eduhub.common.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Health", description = "서버 상태 확인")
@RestController
@RequestMapping("/api/health")
public class HealthController {

  @Operation(summary = "서버 상태 확인", description = "애플리케이션이 요청을 받을 수 있으면 UP을 돌려준다.")
  @GetMapping
  public HealthResponse health() {
    return new HealthResponse("UP");
  }

  public static class HealthResponse {

    private final String status;

    public HealthResponse(String status) {
      this.status = status;
    }

    public String getStatus() {
      return status;
    }
  }
}
