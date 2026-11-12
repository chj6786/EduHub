import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useEffect, useState } from 'react';
import { toApiError } from '../../utils/apiError';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  /** 실패하면 던진다. 메시지는 대화상자 안에 보여 준다. */
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

/** 되돌릴 수 없는 작업(종료) 전에 한 번 더 묻는다 (FR-03). */
export default function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onClose }: ConfirmDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm();
    } catch (e) {
      setError(toApiError(e).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          취소
        </Button>
        <Button color="error" variant="contained" onClick={handleConfirm} disabled={submitting}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
