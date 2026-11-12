import type { CourseRequest } from '@eduhub/api-client';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { type FormEvent, useEffect, useState } from 'react';
import { CATEGORIES } from '../../constants/categories';
import { toApiError } from '../../utils/apiError';

interface FormValues {
  title: string;
  category: string;
  description: string;
}

const EMPTY: FormValues = { title: '', category: '', description: '' };

export interface CourseFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: { title?: string; category?: string; description?: string | null };
  /** 성공하면 부모가 대화상자를 닫는다. 실패하면 ApiError를 던지고 메시지는 폼에 보여 준다. */
  onSubmit: (request: CourseRequest) => Promise<void>;
  onClose: () => void;
}

/** 서버 검증(CourseRequest)과 같은 규칙을 먼저 화면에서 확인한다. */
function validate(values: FormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.title.trim()) errors.title = '과정명을 입력해 주세요.';
  else if (values.title.trim().length > 200) errors.title = '과정명은 200자 이하로 입력해 주세요.';
  if (!values.category.trim()) errors.category = '분류를 선택해 주세요.';
  if (values.description.trim().length > 2000) errors.description = '설명은 2000자 이하로 입력해 주세요.';
  return errors;
}

/** 과정 등록·수정 폼 (FR-03). */
export default function CourseFormDialog({ open, mode, initialValues, onSubmit, onClose }: CourseFormDialogProps) {
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 열릴 때마다 초기값으로 되돌린다.
  useEffect(() => {
    if (!open) return;
    setValues({
      title: initialValues?.title ?? '',
      category: initialValues?.category ?? '',
      description: initialValues?.description ?? '',
    });
    setErrors({});
    setFormError(null);
    // 열릴 때만 초기화한다. initialValues는 일부러 의존성에서 뺀다.
  }, [open]);

  // 목록에 없는 기존 분류도 수정 화면에서 그대로 보이게 한다.
  const categoryOptions: string[] = [...CATEGORIES];
  if (values.category && !categoryOptions.includes(values.category)) categoryOptions.push(values.category);

  const change = (field: keyof FormValues, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validate(values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await onSubmit({
        title: values.title.trim(),
        category: values.category.trim(),
        description: values.description.trim() || undefined,
      });
    } catch (e) {
      const apiError = toApiError(e);
      setErrors(apiError.fieldErrors);
      setFormError(apiError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <Box component="form" noValidate onSubmit={handleSubmit}>
        <DialogTitle>{mode === 'create' ? '과정 등록' : '과정 수정'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="과정명"
              required
              value={values.title}
              onChange={(e) => change('title', e.target.value)}
              error={!!errors.title}
              helperText={errors.title}
              autoFocus
            />
            <TextField
              select
              label="분류"
              required
              value={values.category}
              onChange={(e) => change('category', e.target.value)}
              error={!!errors.category}
              helperText={errors.category}
            >
              {categoryOptions.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="설명"
              multiline
              minRows={3}
              value={values.description}
              onChange={(e) => change('description', e.target.value)}
              error={!!errors.description}
              helperText={errors.description}
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
