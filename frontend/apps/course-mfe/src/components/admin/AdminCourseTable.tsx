import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material';
import { useCourses } from '../../hooks/useCourses';
import { STATUS_LABELS } from './statusLabels';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export interface AdminCourseTableProps {
  keyword: string;
  category: string;
  page: number;
  size: number;
  /** 바꾸면 같은 조건으로 다시 불러온다. 등록·수정·종료 뒤에 부모가 올린다. */
  refreshKey: number;
  selectedId: number | null;
  onSelect: (courseId: number) => void;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
}

/** 관리자 과정 목록 (FR-03). 조회는 FR-01의 useCourses를 그대로 쓴다(종료된 과정도 포함된다). */
export default function AdminCourseTable({
  keyword,
  category,
  page,
  size,
  refreshKey,
  selectedId,
  onSelect,
  onPageChange,
  onSizeChange,
}: AdminCourseTableProps) {
  const { data, loading, error } = useCourses({ keyword, category, page, size, refreshKey });
  const courses = data?.content ?? [];

  if (error) {
    return <Alert severity="error">과정 목록을 불러오지 못했습니다. ({error.message})</Alert>;
  }
  // 처음 불러올 때만 스피너를 보인다. 다시 불러오는 동안에는 표를 유지해 화면 높이가 줄지 않게 한다
  // (줄면 아래 상세 패널이 위로 튀어 보고 있던 위치를 잃는다).
  if (loading && !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress aria-label="불러오는 중" />
      </Box>
    );
  }

  return (
    <TableContainer sx={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s' }} aria-busy={loading}>
      <Table size="small" aria-label="과정 목록">
        <TableHead>
          <TableRow>
            <TableCell width={80}>ID</TableCell>
            <TableCell>과정명</TableCell>
            <TableCell width={120}>분류</TableCell>
            <TableCell width={100}>상태</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {courses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                과정이 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            courses.map((course) => (
              <TableRow
                key={course.id}
                hover
                selected={course.id === selectedId}
                onClick={() => onSelect(course.id!)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{course.id}</TableCell>
                <TableCell>{course.title}</TableCell>
                <TableCell>{course.category}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={STATUS_LABELS[course.status ?? ''] ?? course.status}
                    color={course.status === 'OPEN' ? 'success' : 'default'}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={data?.totalElements ?? 0}
        page={page}
        rowsPerPage={size}
        rowsPerPageOptions={PAGE_SIZE_OPTIONS}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(e) => onSizeChange(Number(e.target.value))}
        labelRowsPerPage="페이지당"
      />
    </TableContainer>
  );
}
