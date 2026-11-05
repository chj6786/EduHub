package com.example.eduhub.common.api;

import java.util.List;
import org.springframework.data.domain.Page;

/** 페이지 응답. page는 0부터 시작한다. */
public class PageResponse<T> {

  private final List<T> content;
  private final int page;
  private final int size;
  private final long totalElements;

  public PageResponse(List<T> content, int page, int size, long totalElements) {
    this.content = content;
    this.page = page;
    this.size = size;
    this.totalElements = totalElements;
  }

  public static <T> PageResponse<T> from(Page<T> page) {
    return new PageResponse<>(
        page.getContent(), page.getNumber(), page.getSize(), page.getTotalElements());
  }

  public List<T> getContent() {
    return content;
  }

  public int getPage() {
    return page;
  }

  public int getSize() {
    return size;
  }

  public long getTotalElements() {
    return totalElements;
  }
}
