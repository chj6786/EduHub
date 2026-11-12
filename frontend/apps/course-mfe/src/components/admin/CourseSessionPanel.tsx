import type { SessionResponse } from '@eduhub/api-client';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useAdminCourseDetail } from '../../hooks/useAdminCourseDetail';
import { useCourseAdminActions } from '../../hooks/useCourseAdminActions';
import { STATUS_LABELS } from './statusLabels';
import ConfirmDialog from './ConfirmDialog';
import CourseFormDialog from './CourseFormDialog';
import SessionFormDialog from './SessionFormDialog';

export interface CourseSessionPanelProps {
  courseId: number;
  /** 과정 정보·상태가 바뀌어 목록을 다시 불러와야 할 때. */
  onCourseChanged: () => void;
  onNotify: (message: string) => void;
}

type SessionDialog = { mode: 'create' } | { mode: 'edit'; session: SessionResponse } | null;

/** 선택한 과정의 수정·종료와 회차 등록·수정·종료 (FR-03). */
export default function CourseSessionPanel({ courseId, onCourseChanged, onNotify }: CourseSessionPanelProps) {
  const { data: course, loading, error, reload } = useAdminCourseDetail(courseId);
  const actions = useCourseAdminActions();

  const [editCourseOpen, setEditCourseOpen] = useState(false);
  const [closeCourseOpen, setCloseCourseOpen] = useState(false);
  const [sessionDialog, setSessionDialog] = useState<SessionDialog>(null);
  const [closeSessionTarget, setCloseSessionTarget] = useState<SessionResponse | null>(null);

  if (loading && !course) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress aria-label="과정 상세 불러오는 중" />
      </Box>
    );
  }
  if (error) {
    return <Alert severity="error">과정 상세를 불러오지 못했습니다. ({error.message})</Alert>;
  }
  if (!course) return null;

  const closed = course.status === 'CLOSED';
  const sessions = course.sessions ?? [];
  const openSessionCount = sessions.filter((s) => s.status === 'OPEN').length;

  return (
    <Paper variant="outlined" sx={{ p: 2 }} component="section" aria-label="과정 상세 관리">
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'center' }, mb: 1 }}>
        <Typography variant="h6" component="h2" sx={{ flex: 1 }}>
          {course.title}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Chip size="small" label={course.category} variant="outlined" />
          <Chip
            size="small"
            label={STATUS_LABELS[course.status ?? ''] ?? course.status}
            color={closed ? 'default' : 'success'}
          />
        </Stack>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
        {course.description || '설명 없음'}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap' }}>
        <Button variant="outlined" onClick={() => setEditCourseOpen(true)} disabled={closed}>
          과정 수정
        </Button>
        <Button variant="outlined" color="error" onClick={() => setCloseCourseOpen(true)} disabled={closed}>
          과정 종료
        </Button>
      </Stack>
      {closed && (
        <Alert severity="info" sx={{ mb: 2 }}>
          종료된 과정은 수정하거나 회차를 추가할 수 없습니다.
        </Alert>
      )}

      <Stack direction="row" sx={{ alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1" component="h3" sx={{ flex: 1 }}>
          회차 ({sessions.length})
        </Typography>
        <Button variant="contained" size="small" onClick={() => setSessionDialog({ mode: 'create' })} disabled={closed}>
          회차 등록
        </Button>
      </Stack>
      <TableContainer>
        <Table size="small" aria-label="회차 목록">
          <TableHead>
            <TableRow>
              <TableCell>시작일</TableCell>
              <TableCell>장소</TableCell>
              <TableCell align="right">정원</TableCell>
              <TableCell>상태</TableCell>
              <TableCell align="right">작업</TableCell>
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
              sessions.map((session) => {
                const sessionClosed = session.status === 'CLOSED';
                return (
                  <TableRow key={session.id}>
                    <TableCell>{session.startDate}</TableCell>
                    <TableCell>{session.place}</TableCell>
                    <TableCell align="right">{session.capacity}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={STATUS_LABELS[session.status ?? ''] ?? session.status}
                        color={sessionClosed ? 'default' : 'success'}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Button
                        size="small"
                        onClick={() => setSessionDialog({ mode: 'edit', session })}
                        disabled={sessionClosed}
                        aria-label={`${session.startDate} 회차 수정`}
                      >
                        수정
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => setCloseSessionTarget(session)}
                        disabled={sessionClosed}
                        aria-label={`${session.startDate} 회차 종료`}
                      >
                        종료
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <CourseFormDialog
        open={editCourseOpen}
        mode="edit"
        initialValues={course}
        onClose={() => setEditCourseOpen(false)}
        onSubmit={async (request) => {
          await actions.updateCourse(courseId, request);
          setEditCourseOpen(false);
          reload();
          onCourseChanged();
          onNotify('과정을 수정했습니다.');
        }}
      />

      <ConfirmDialog
        open={closeCourseOpen}
        title="과정 종료"
        message={`'${course.title}' 과정을 종료합니다. 운영 중인 회차 ${openSessionCount}개도 함께 종료되며 되돌릴 수 없습니다.`}
        confirmLabel="종료"
        onClose={() => setCloseCourseOpen(false)}
        onConfirm={async () => {
          await actions.closeCourse(courseId);
          setCloseCourseOpen(false);
          reload();
          onCourseChanged();
          onNotify('과정을 종료했습니다.');
        }}
      />

      <SessionFormDialog
        open={sessionDialog !== null}
        mode={sessionDialog?.mode ?? 'create'}
        initialValues={sessionDialog?.mode === 'edit' ? sessionDialog.session : undefined}
        onClose={() => setSessionDialog(null)}
        onSubmit={async (request) => {
          if (sessionDialog?.mode === 'edit') {
            await actions.updateSession(sessionDialog.session.id!, request);
            onNotify('회차를 수정했습니다.');
          } else {
            await actions.createSession(courseId, request);
            onNotify('회차를 등록했습니다.');
          }
          setSessionDialog(null);
          reload();
        }}
      />

      <ConfirmDialog
        open={closeSessionTarget !== null}
        title="회차 종료"
        message={`${closeSessionTarget?.startDate ?? ''} ${closeSessionTarget?.place ?? ''} 회차를 종료합니다. 되돌릴 수 없습니다.`}
        confirmLabel="종료"
        onClose={() => setCloseSessionTarget(null)}
        onConfirm={async () => {
          await actions.closeSession(closeSessionTarget!.id!);
          setCloseSessionTarget(null);
          reload();
          onNotify('회차를 종료했습니다.');
        }}
      />
    </Paper>
  );
}
