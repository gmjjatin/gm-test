import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import AppContext from '../AppContext';
import { DialogContentStyle, InputLabelProps, PaperProps } from '../../utils/constants';

export default function CameraDialog(props) {
  const myContext = React.useContext(AppContext);
  const [open, setOpen] = React.useState(true);
  const { onConfirm, onClose } = props;

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const confirmSubmit = () => {
    onConfirm();
    setOpen(false);
  };


  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={PaperProps}
      >
        <DialogTitle>Stream Camera</DialogTitle>
        <DialogContent>
          <DialogContentText style={DialogContentStyle}>
            Connect to the ip camera
          </DialogContentText>
          <TextField
            autoFocus
            className="input-text"
            margin="dense"
            id="name"
            label="Enter the url of camera"
            InputLabelProps={InputLabelProps}
            type="text"
            fullWidth
            variant="standard"
            value={myContext.url}
            onChange={(e) => {
              myContext.setUrl(e.target.value)
            }}
          />
          <TextField
            className="input-text"
            autoFocus
            margin="dense"
            id="name"
            label="Enter serial number"
            InputLabelProps={InputLabelProps}
            type="text"
            fullWidth
            variant="standard"
            value={myContext.serialNumber}
            onChange={(e) => myContext.setSerialNumber(e.target.value)}
          />
          <TextField
            className="input-text"
            autoFocus
            margin="dense"
            id="name"
            label="Enter user id"
            InputLabelProps={InputLabelProps}
            type="text"
            fullWidth
            variant="standard"
            value={myContext.userId}
            onChange={(e) => myContext.setUserId(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={confirmSubmit}>Connect</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
