import {
  Button,
  Chip,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { type FormEvent, useState } from 'react';
import AdminCourseTable from '../../components/admin/AdminCourseTable';
import CourseFormDialog from '../../components/admin/CourseFormDialog';
import CourseSessionPanel from '../../components/admin/CourseSessionPanel';
import { CATEGORIES } from '../../constants/categories';
import { useCourseAdminActions } from '../../hooks/useCourseAdminActions';

/**
 * 관리자 과정·회차 관리 화면 (FR-03). 목록에서 과정을 고르면 아래에 상세와 회차 관리가 열린다.
 * TODO(NFR-03): 인증이 생기면 관리자만 들어오게 막는다. 지금은 권한 검사가 없다(D-01).
 */
export default function AdminCoursePage() {
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  // 올리면 목록을 같은 조건으로 다시 불러온다.
  const [listVersion, setListVersion] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const { createCourse } = useCourseAdminActions();
  const refreshList = () => setListVersion((v) => v + 1);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    setKeyword(keywordInput.trim());
    setPage(0);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
        <Typography variant="h5" component="h1" sx={{ flex: 1 }}>
          과정 관리
        </Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>
          과정 등록
        </Button>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
        <Chip size="small" label="관리자" color="primary" variant="outlined" />
        <Typography variant="caption" color="text.secondary">
          권한 검사는 로그인 기능이 생기면 적용됩니다.
        </Typography>
      </Stack>

      <Stack
        component="form"
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 2 }}
        onSubmit={handleSearch}
      >
        <TextField
          label="과정명"
          size="small"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          sx={{ flex: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="admin-category-label">분류</InputLabel>
          <Select
            labelId="admin-category-label"
            label="분류"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">전체</MenuItem>
            {CATEGORIES.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button type="submit" variant="outlined">
          검색
        </Button>
      </Stack>

      <AdminCourseTable
        refreshKey={listVersion}
        keyword={keyword}
        category={category}
        page={page}
        size={size}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onPageChange={setPage}
        onSizeChange={(newSize) => {
          setSize(newSize);
          setPage(0);
        }}
      />

      {selectedId !== null && (
        <Stack sx={{ mt: 3 }}>
          <CourseSessionPanel
            key={selectedId}
            courseId={selectedId}
            onCourseChanged={refreshList}
            onNotify={setNotice}
          />
        </Stack>
      )}

      <CourseFormDialog
        open={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
        onSubmit={async (request) => {
          const created = await createCourse(request);
          setCreateOpen(false);
          // 새 과정은 id 내림차순 첫 페이지 맨 위에 보인다. 바로 회차를 등록할 수 있게 선택해 둔다.
          setKeyword('');
          setKeywordInput('');
          setCategory('');
          setPage(0);
          setSelectedId(created.id ?? null);
          refreshList();
          setNotice('과정을 등록했습니다.');
        }}
      />

      <Snackbar
        open={notice !== null}
        autoHideDuration={3000}
        onClose={() => setNotice(null)}
        message={notice}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
}
