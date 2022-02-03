import React, { useState, useEffect, useContext } from "react";
import { Row, Col } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import BrightnessIcon from "../../assets/icons8-sun-50.png";
import ContrastIcon from "../../assets/icons8-contrast-50.png";
import ColorbalanceIcon from "../../assets/icons8-light-50.png";
import SettingsIcon from "../../assets/settings-icon.png";
import RotateIcon from "../../assets/rotate-icon.png";
import FlagIcon from "../../assets/flag-icon.png";
import FolderIcon from "../../assets/folder-icon.png";
import CameraIcon from "../../assets/camera-icon.png";
import ExitIcon from "../../assets/icons8-sign-out-50.png";
import Slider from "@mui/material/Slider";
import JsmpegPlayer from "../JsmpegPlayer";
import Timer from "./timer";
import AppContext from "../AppContext";
import GrumpyIcon from "../../assets/grumpy.png";
import "./style.css";
import contentEditable from "../HOC/editableContent";
import { editableCharLimit } from "../../utils/constants";
const { ipcRenderer } = window.require("electron");

const videoOptions = {};

const videoOverlayOptions = { preserveDrawingBuffer: true };
const angles = [0, 1.57, 3.14, 4.71];

const EditableSpan = contentEditable("span");

function MainScreen() {
  const history = useHistory();
  const myContext = useContext(AppContext);

  const [date, setDate] = useState(null);
  const [brightnessSlider, setBrightnessSlider] = useState(false);
  const [brightnessLevel, setBrightnessLevel] = useState(0);
  const [contrastSlider, setContrastSlider] = useState(false);
  const [contrastLevel, setContrastLevel] = useState(1);
  const [colorBalanceLevel, setColorBalanceLevel] = useState(0);
  const [colorBalanceSlider, setColorBalanceSlider] = useState(false);
  const [jsmpegPlayer, setJsmpegPlayer] = useState(null);
  const [selectedAngle, setSelectedAngle] = useState(0);
  // let jsmpegPlayer = null;

  const changeBrightness = (e) => {
    const currentBrightnessLevel = e.target.value;
    if (currentBrightnessLevel != brightnessLevel) {
      console.log(currentBrightnessLevel);
      const data = { brightness: currentBrightnessLevel };
      setBrightnessLevel(currentBrightnessLevel);
      ipcRenderer.send("change_brightness", data);
    }
  };

  const changeColorBalance = (e) => {
    const currentColorBalanceLevel = e.target.value;
    if (currentColorBalanceLevel != colorBalanceLevel) {
      const data = { colorBalance: currentColorBalanceLevel };
      setColorBalanceLevel(currentColorBalanceLevel);
      ipcRenderer.send("change_color_balance", data);
    }
  };

  const changeContrast = (e) => {
    const currentContrastLevel = e.target.value;
    if (currentContrastLevel != contrastLevel) {
      console.log(currentContrastLevel);
      const data = { contrast: currentContrastLevel };
      setContrastLevel(currentContrastLevel);
      ipcRenderer.send("change_contrast", data);
    }
  };

  const goToMediaScreen = () => {
    stopStreaming();
  
    history.push("/media");
  };

  const goToSetupScreen = () => {
    stopStreaming();
    history.push("/");
  };

  const stopStreaming = async () => {
    await jsmpegPlayer.destroy();
    setJsmpegPlayer(null);
    ipcRenderer.send("stop_streaming", {});
  }

  const clickScreenshot = () => {
    if (jsmpegPlayer !== null) {
      jsmpegPlayer.frame();
    }
  };


  const streamVideo = () => {
    let timestamp = new Date().toISOString().split(".")[0];
    timestamp = timestamp.replaceAll(/-|:|T/g, "");
    ipcRenderer.send("get_media_path", { }); // send request
    ipcRenderer.on("get_media_path", (event, dirPath) => {
      // IPC event listener
      console.log(dirPath); // show the response data
      if (dirPath) {
        // dont pass the extension, stopStream() will do it
        const streamPath = `${dirPath}uid-ser-${timestamp}`;
        console.log(streamPath);
        // story streamPath to global state
        myContext.setDirPath(`${dirPath}`);
        const data = { streamUrl: myContext.url, streamPath };
        ipcRenderer.send("start_streaming", data); // send request
      }
    });
  };

  useEffect(() => {
    streamVideo();
    const angle = angles[0];
    console.log(angle);
    const data = { angle };
    ipcRenderer.send("rotate", data);

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    var yyyy = today.getFullYear();

    today = mm + "/" + dd + "/" + yyyy;
    setDate(today);
  }, []);

  const rotateCamera = () => {
    let nextAngle = 0;
    if (selectedAngle === 3) {
      nextAngle = 0;
    } else {
      nextAngle = selectedAngle + 1;
    }
    setSelectedAngle(nextAngle);
    const angle = angles[nextAngle];
    console.log(angle);
    const data = { angle };
    ipcRenderer.send("rotate", data);
  };

  return (
    <div className="App-header">
      <div className="mt-1">
        <Row className="mt-2">
          <Col sm={12} md={3} lg={2}>
            <button type="button" className="small_button">
              <Timer />
            </button>
          </Col>

          <Col sm={12} md={3} lg={2}>
            <button type="button" className="small_button">
              {date}
            </button>
          </Col>

          <Col sm={12} md={3} lg={3}>
            <button type="button" className="small_button">
              <EditableListItem
                value={myContext.serialNumber}
                setValue={myContext.setSerialNumber}
              />
            </button>
          </Col>

          <Col sm={12} md={3} lg={4}>
            <button type="button" className="small_button">
              <EditableListItem
                value={myContext.userId}
                setValue={myContext.setUserId}
              />
            </button>
          </Col>

          <Col sm={12} md={3} lg={1}>
            <img
              src={ExitIcon}
              alt=""
              onClick={goToSetupScreen}
              className="exit-icon svg_icons"
            />
          </Col>
        </Row>
      </div>

      <div>
        <Row>
          <Col sm={12} md={3} lg={3}>
            <div className="vertical-center">
              <div>
                <Row>
                  <Col sm={12} md={6} lg={4}>
                    <img
                      src={BrightnessIcon}
                      alt=""
                      onClick={() => setBrightnessSlider(!brightnessSlider)}
                      className="m-4 svg_icons"
                    />
                  </Col>
                  <Col sm={12} md={6} lg={8}>
                    {brightnessSlider && (
                      <Slider
                        onChange={changeBrightness}
                        className="mt-4 slider_icons"
                        size="small"
                        value={brightnessLevel}
                        min={-1.0}
                        max={1.0}
                        step={0.1}
                        aria-label="Small"
                        valueLabelDisplay="auto"
                      />
                    )}
                  </Col>
                </Row>
              </div>
              <div>
                <Row>
                  <Col sm={12} md={6} lg={4}>
                    <img
                      src={ContrastIcon}
                      alt=""
                      onClick={() => setContrastSlider(!contrastSlider)}
                      className="m-4 svg_icons"
                    />
                  </Col>
                  <Col sm={12} md={6} lg={8}>
                    {contrastSlider && (
                      <Slider
                        onChange={changeContrast}
                        className="mt-4 slider_icons"
                        size="small"
                        value={contrastLevel}
                        min={0}
                        max={2.0}
                        step={0.1}
                        aria-label="Small"
                        valueLabelDisplay="auto"
                      />
                    )}
                  </Col>
                </Row>
              </div>
              <div>
                <Row>
                  <Col sm={12} md={6} lg={4}>
                    <img
                      src={ColorbalanceIcon}
                      alt=""
                      onClick={() => setColorBalanceSlider(!colorBalanceSlider)}
                      className="m-4 svg_icons"
                    />
                  </Col>
                  <Col sm={12} md={6} lg={8}>
                    {colorBalanceSlider && (
                      <Slider
                        onChange={changeColorBalance}
                        className="mt-4 slider_icons"
                        size="small"
                        value={colorBalanceLevel}
                        min={-2}
                        max={2}
                        step={1}
                        aria-label="Small"
                        valueLabelDisplay="auto"
                      />
                    )}
                  </Col>
                </Row>
              </div>
              <div>
                <Row>
                  <Col sm={12} md={6} lg={4}>
                    <img
                      src={RotateIcon}
                      alt=""
                      onClick={rotateCamera}
                      className="m-4 svg_icons"
                    />
                  </Col>
                </Row>
              </div>
            </div>
          </Col>

          <Col sm={12} md={9} lg={9} className="mt-4">
            <div className="fill" id="video-play">
              <JsmpegPlayer
                wrapperClassName="video-wrapper"
                videoUrl="ws://localhost:8082"
                options={videoOptions}
                overlayOptions={videoOverlayOptions}
                serialNumber={myContext.serialNumber}
                userId={myContext.userId}
                path={myContext.getDirPath}
                onRef={(ref) => {
                  ref && setJsmpegPlayer(ref);
                }}
              />
            </div>
          </Col>
        </Row>
      </div>

      <div>
        <Row>
          <Col sm={12} md={4} lg={3}>
            <img
              src={SettingsIcon}
              alt=""
              onClick={goToSetupScreen}
              className="m-4 svg_icons"
            />
            <img
              src={FolderIcon}
              alt=""
              onClick={goToMediaScreen}
              className="m-4 svg_icons"
            />
          </Col>

          <Col sm={12} md={4} lg={4} className="text-right">
            <img
              src={CameraIcon}
              alt=""
              onClick={clickScreenshot}
              className="m-4 svg_icons"
            />
          </Col>

          <Col sm={12} md={4} lg={4} className="text-right">
            <img
              src={FlagIcon}
              alt=""
              onClick={goToMediaScreen}
              className="m-4 svg_icons"
            />
          </Col>

          <Col sm="auto" className="text-right">
            <img
              src={GrumpyIcon}
              alt=""
              className="m-4 svg_icons"
            />
          </Col>
        </Row>
      </div>
    </div>
  );
}
const EditableListItem = ({ setValue, value }) => {
  return (
    <EditableSpan
      suppressContentEditableWarning={true}
      value={value}
      onSave={(val) => {
        // char limit of 30
        if (val.length < editableCharLimit) {
          setValue(val);
        } else {
          setValue(value);
        }
      }}
    />
  );
};
export default MainScreen;
