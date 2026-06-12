import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material'

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', confirmColor = 'error' }) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ pb: 2, px: 2 }}>
        <Button onClick={onCancel} variant="outlined" sx={{ borderRadius: 2 }}>{cancelText}</Button>
        <Button onClick={onConfirm} variant="contained" color={confirmColor} sx={{ borderRadius: 2 }}>{confirmText}</Button>
      </DialogActions>
    </Dialog>
  )
}
