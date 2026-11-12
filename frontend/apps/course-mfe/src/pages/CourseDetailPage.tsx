import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { STATUS_LABELS } from '../constants/status';
import { useCourseDetail } from '../hooks/useCourseDetail';

export interface CourseDetailPageProps {
  courseId: number;
  onBack: () => void;
}

/** 과정 상세와 회차 화면 (FR-02). 데이터는 useCourseDetail로만 가져온다. */
export default function CourseDetailPage({ courseId, onBack }: CourseDetailPageProps) {
  const { data, loading, error, notFound } = useCourseDetail(courseId);
  const sessions = data?.sessions ?? [];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button onClick={onBack} sx={{ mb: 2 }}>
        ← 과정 목록으로
      </Button>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress aria-label="불러오는 중" />
        </Box>
      ) : notFound ? (
        <Alert severity="warning">과정을 찾을 수 없습니다.</Alert>
      ) : error ? (
        <Alert severity="error">과정 정보를 불러오지 못했습니다. ({error.message})</Alert>
      ) : (
        data && (
          <>
            <Typography variant="h5" component="h1" gutterBottom>
              {data.title}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Chip size="small" variant="outlined" label={data.category} />
              <Chip
                size="small"
                label={STATUS_LABELS[data.status ?? ''] ?? data.status}
                color={data.status === 'OPEN' ? 'success' : 'default'}
              />
            </Stack>
            {data.description && (
              <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
                {data.description}
              </Typography>
            )}

            <Typography variant="h6" component="h2" gutterBottom>
              회차
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width={120}>시작일</TableCell>
                    <TableCell>장소</TableCell>
                    <TableCell width={80} align="right">
                      정원
                    </TableCell>
                    <TableCell width={100} align="right">
                      남은 자리
                    </TableCell>
                    <TableCell width={100}>상태</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        등록된 회차가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>{session.startDate}</TableCell>
                        <TableCell>{session.place}</TableCell>
                        <TableCell align="right">{session.capacity}</TableCell>
                        <TableCell align="right">{session.remainingSeats}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={STATUS_LABELS[session.status ?? ''] ?? session.status}
                            color={session.status === 'OPEN' ? 'success' : 'default'}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )
      )}
    </Container>
  );
}
