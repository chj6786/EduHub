import { Box } from '@mui/material';
import { useState } from 'react';
import CourseDetailPage from './pages/CourseDetailPage';
import CourseListPage from './pages/CourseListPage';

/**
 * 과정 목록과 상세를 상태로 전환한다 (FR-01, FR-02).
 * 라우팅은 나중에 shell이 맡을 수 있어 MFE 안에는 라우터를 두지 않는다.
 * 목록은 숨기기만 하고 언마운트하지 않아서, 상세에서 돌아오면 검색어와 페이지가 그대로 남는다.
 */
export default function CourseApp() {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  return (
    <>
      <Box hidden={selectedCourseId !== null}>
        <CourseListPage onSelectCourse={setSelectedCourseId} />
      </Box>
      {selectedCourseId !== null && (
        <CourseDetailPage courseId={selectedCourseId} onBack={() => setSelectedCourseId(null)} />
      )}
    </>
  );
}
