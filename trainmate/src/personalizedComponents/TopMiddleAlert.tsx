import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

interface TopMiddleAlertProps {
  alertText: string;
  open: boolean;
  onClose: () => void;
  severity: "success" | "error" | "warning" | "info";
}

export default function TopMiddleAlert({ alertText, open, onClose, severity }: TopMiddleAlertProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {alertText}
      </Alert>
    </Snackbar>
  );
}