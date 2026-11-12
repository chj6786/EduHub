import type { SessionRequest } from '@eduhub/api-client';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { type FormEvent, useEffect, useState } from 'react';
import { toApiError } from '../../utils/apiError';
import { todayString } from '../../utils/date';

interface FormValues {
  startDate: string;
  place: string;
  capacity: string;
}

export interface SessionFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: { startDate?: string; place?: string; capacity?: number };
  /** 성공하면 부모가 대화상자를 닫는다. 실패하면 ApiError를 던지고 메시지는 폼에 보여 준다. */
  onSubmit: (request: SessionRequest) => Promise<void>;
  onClose: () => void;
}

/** 서버 검증(SessionRequest)과 같은 규칙. 시작일은 오늘 이후만(D-04). */
function validate(values: FormValues, today: string): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.startDate) errors.startDate = '시작일을 입력해 주세요.';
  // YYYY-MM-DD는 문자열 비교가 날짜 비교와 같다.
  else if (values.startDate < today) errors.startDate = '시작일은 오늘 이후여야 합니다.';
  if (!values.place.trim()) errors.place = '장소를 입력해 주세요.';
  else if (values.place.trim().length > 200) errors.place = '장소는 200자 이하로 입력해 주세요.';
  const capacity = Number(values.capacity);
  if (!values.capacity.trim()) errors.capacity = '정원을 입력해 주세요.';
  else if (!Number.isInteger(capacity) || capacity < 1 || capacity > 1000)
    errors.capacity = '정원은 1~1000 사이의 정수로 입력해 주세요.';
  return errors;
}

/** 회차 등록·수정 폼 (FR-03). */
export default function SessionFormDialog({ open, mode, initialValues, onSubmit, onClose }: SessionFormDialogProps) {
  const [values, setValues] = useState<FormValues>({ startDate: '', place: '', capacity: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const today = todayString();

  useEffect(() => {
    if (!open) return;
    setValues({
      startDate: initialValues?.startDate ?? '',
      place: initialValues?.place ?? '',
      capacity: initialValues?.capacity !== undefined ? String(initialValues.capacity) : '',
    });
    setErrors({});
    setFormError(null);
    // 열릴 때만 초기화한다. initialValues는 일부러 의존성에서 뺀다.
  }, [open]);

  const change = (field: keyof FormValues, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validate(values, today);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await onSubmit({ startDate: values.startDate, place: values.place.trim(), capacity: Number(values.capacity) });
    } catch (e) {
      const apiError = toApiError(e);
      setErrors(apiError.fieldErrors);
      setFormError(apiError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="xs" fullWidth>
      <Box component="form" noValidate onSubmit={handleSubmit}>
        <DialogTitle>{mode === 'create' ? '회차 등록' : '회차 수정'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="시작일"
              type="date"
              required
              value={values.startDate}
              onChange={(e) => change('startDate', e.target.value)}
              error={!!errors.startDate}
              helperText={errors.startDate}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: today } }}
            />
            <TextField
              label="장소"
              required
              value={values.place}
              onChange={(e) => change('place', e.target.value)}
              error={!!errors.place}
              helperText={errors.place}
            />
            <TextField
              label="정원"
              type="number"
              required
              value={values.capacity}
              onChange={(e) => change('capacity', e.target.value)}
              error={!!errors.capacity}
              helperText={errors.capacity}
              slotProps={{ htmlInput: { min: 1, max: 1000 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            취소
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {mode === 'create' ? '등록' : '저장'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
