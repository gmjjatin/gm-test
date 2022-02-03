import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { DialogContentStyle, InputLabelProps, PaperProps } from '../../utils/constants';

export default function InputDialog(props) {
  const [open, setOpen] = React.useState(true);
  const { onConfirm, onClose, selectedSsid,wifipwd } = props;
  const [password,setPassword] = React.useState(wifipwd);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const confirmPassword = (value) => {
    onConfirm(value);
    setOpen(false);
  };
  

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={PaperProps}
      >
        <DialogTitle>Password</DialogTitle>
        <DialogContent>
          <DialogContentText style={DialogContentStyle}>
            Connect to {selectedSsid}
          </DialogContentText>
          <TextField
            className="input-text"
            autoFocus
            margin="dense"
            id="name"
            label="Password"
            type="password"
            fullWidth
            variant="standard"
            InputLabelProps={InputLabelProps}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={() => confirmPassword(password)}>Connect</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
