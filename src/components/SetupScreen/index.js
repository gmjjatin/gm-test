import React, { useState, useEffect } from "react";
import { useHistory, Link } from "react-router-dom";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import SsidDialog from "../SsidDialog";
import InputDialog from "../InputDialog";
import CameraDialog from "../CameraDialog";
import AppContext from "../AppContext";
const { ipcRenderer } = window.require("electron");

function SetupScreen() {
  const history = useHistory();
  const myContext = React.useContext(AppContext);

  const [open, setOpen] = React.useState(false);
  const [ssids, setSsids] = useState([]);
  const [selectedSsid, setSelectedSsid] = React.useState("");
  const [wifipwd, setWifipwd] = React.useState("");
  const [openInput, setOpenInput] = React.useState(false);
  const [openCameraDialog, setCameraDialog] = React.useState(false);
  const [connect, setConnect] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const openSsidList = () => {
    setOpen(true);
  };

  const closeSsidList = (value) => {
    setOpen(false);
    setSelectedSsid(value);
    // store globally as well
    myContext.selectSSID(value);
    ipcRenderer.send("fetch_saved_ssid_pwd", { ssid:value }); // send request
    ipcRenderer.on("fetch_saved_ssid_pwd", (event, data) => {
      // IPC event listener
    //  console.log("fetch_saved_ssid_pwd",data); // show the response data
      if (data) {
        setWifipwd(data.pwd);
      } else {
        setWifipwd("");
      }

    setOpenInput(true);
    });
  };

  const handleConfirmInput = async (value) => {
    setConnecting(true);
    setOpenInput(false);
    // store globally as well
    myContext.setSSIDpwd(value);
    ipcRenderer.send("save_ssid_pwd", { ssid:selectedSsid, pwd:value }); // send request
    connectToSsid(selectedSsid, value);
  };

  const closeInput = () => {
    setOpenInput(false);
    setSelectedSsid("");
  };


  const connectToSsid = (ssid, pwd) => {
    ipcRenderer.send("connect_ssid", { ssid, pwd }); // send request
    ipcRenderer.on("connect_ssid", (event, data) => {
      // IPC event listener
      console.log(data); // show the response data
      if (data) {
        setConnect(true);
        setConnecting(false);
        // auto open Camera URL Dialog box
        setCameraDialog(true);
      } else {
        setConnect(false);
        setSelectedSsid("");
        setConnecting(false);
      }
    });
  };

  const handleDisconnect = () => {
    ipcRenderer.send("disconnect_ssid", "dummy_message"); // send request
    ipcRenderer.on("disconnect_ssid", (event, data) => {
      // IPC event listener

      if (data) {
        setConnect(false);
        setSelectedSsid("");
      }
    });
  };

  const handleCameraDialog = () => {
    setCameraDialog(!openCameraDialog);
  };

  const handleConfirmCameraDialog = () => {
    history.push("/main");
  };

  useEffect(() => {
    // if previously connect, auto connect
    if (myContext.SSIDpwd) {
      connectToSsid(myContext.selectedSSID, myContext.SSIDpwd);
    }

    ipcRenderer.send("isWifiConnected", "message"); // send request
    setConnecting(true);
    ipcRenderer.on("isWifiConnected", (event, data) => {
      // IPC event listener
      console.log(data); // show the response data
      if (data.length > 0) {
        setSelectedSsid(data);
        setConnect(true);
        // auto open Camera URL Dialog box
        setCameraDialog(true);
      }
      setConnecting(false);
    });
    ipcRenderer.send("get_ssids", "message"); // send request
    ipcRenderer.on("get_ssids", (event, data) => {
      // IPC event listener
      console.log(data); // show the response data
      setSsids(data);
    });
  }, []);

  const goToMain = () => {
    history.push("/main");
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>
          <button
            onClick={goToMain}
            type="button"
            className="link_button back_button"
          >
            Go to Main
          </button>
          Setup
        </h1>
        {/*  <Link to="/main">Main</Link> */}
        {/*  <Link to="/media">Media</Link> */}

        <div>
          <br />
          {connect ? (
            <>
              <span>You are connected to {selectedSsid}</span>
              <Button
                variant="contained"
                color="error"
                onClick={handleDisconnect}
                style={{ marginLeft: "20px" }}
              >
                Disconect
              </Button>

              <br />
              <br />

              {openCameraDialog ? (
                <CameraDialog
                  onConfirm={handleConfirmCameraDialog}
                  onClose={handleCameraDialog}
                />
              ) : (
                <Button variant="contained" onClick={handleCameraDialog}>
                  Enter Camera URL
                </Button>
              )}
            </>
          ) : connecting ? (
            <>
              <span> Connecting to your SSID </span>
              <CircularProgress color="secondary" />
            </>
          ) : (
            <>
              <Button variant="contained" onClick={openSsidList}>
                Select SSID
              </Button>
              <SsidDialog
                selectedSsid={selectedSsid}
                open={open}
                onClose={closeSsidList}
                ssids={ssids}
              />
              {selectedSsid && selectedSsid !== "" && openInput && (
                <InputDialog
                  onConfirm={handleConfirmInput}
                  onClose={closeInput}
                  selectedSsid={selectedSsid}
                  wifipwd={wifipwd}
                />
              )}
            </>
          )}
        </div>
      </header>
    </div>
  );
}

export default SetupScreen;
