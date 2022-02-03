import * as React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { blue } from '@mui/material/colors';
import NetworkWifiIcon from '@mui/icons-material/NetworkWifi';
import { PaperProps } from '../../utils/constants';

export default function SsidDialog(props) {
  const { onClose, open, ssids } = props;

  const handleClose = () => {
    onClose();
  };

  const handleListItemClick = (value) => {
    onClose(value);
  };

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      PaperProps={PaperProps}
    >
      <DialogTitle>Select SSID</DialogTitle>
      <List sx={{ pt: 0 }}>
        {ssids.map((ssid) => (
          <ListItem button onClick={() => handleListItemClick(ssid.ssid)} key={ssid.ssid}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
                <NetworkWifiIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={ssid.ssid} />
          </ListItem>
        ))}
  
      </List>
    </Dialog>
  );
}

SsidDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};
