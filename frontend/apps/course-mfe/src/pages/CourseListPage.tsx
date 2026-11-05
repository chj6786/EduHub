import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { type FormEvent, useState } from 'react';
import { CATEGORIES } from '../constants/categories';
import { useCourses } from '../hooks/useCourses';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const STATUS_LABELS: Record<string, string> = {
  OPEN: '운영중',
  CLOSED: '종료',
};

/** 과정 목록 화면 (FR-01). 데이터는 useCourses로만 가져온다. */
export default function CourseListPage() {
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);

  const { data, loading, error } = useCourses({ keyword, category, page, size });
  const courses = data?.content ?? [];

  // 검색 조건이 바뀌면 첫 페이지부터 다시 본다.
  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    setKeyword(keywordInput.trim());
    setPage(0);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPage(0);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        교육과정
      </Typography>

      <Stack component="form" direction="row" spacing={2} sx={{ mb: 2 }} onSubmit={handleSearch}>
        <TextField
          label="과정명"
          size="small"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          sx={{ flex: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="category-label">분류</InputLabel>
          <Select
            labelId="category-label"
            label="분류"
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <MenuItem value="">전체</MenuItem>
            {CATEGORIES.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button type="submit" variant="contained">
          검색
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          과정 목록을 불러오지 못했습니다. ({error.message})
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress aria-label="불러오는 중" />
        </Box>
      ) : (
        !error && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>과정명</TableCell>
                  <TableCell width={120}>분류</TableCell>
                  <TableCell width={100}>상태</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      검색 결과가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  courses.map((course) => (
                    <TableRow key={course.id} hover>
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
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setSize(Number(e.target.value));
                setPage(0);
              }}
              labelRowsPerPage="페이지당"
            />
          </TableContainer>
        )
      )}
    </Container>
  );
}
