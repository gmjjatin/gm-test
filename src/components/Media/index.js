import React, { useState, useEffect, useContext } from "react";
import { Link, useHistory } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import { Skeleton } from "@mui/material";
import { makeStyles } from "@mui/styles";
import AppContext from "../AppContext";
import "./style.css";
const { ipcRenderer } = window.require("electron");

const columns = [{ field: "fileName", headerName: "File name", width: "600" }];

const videoOptions = {
  autoplay: true,
};

const videoOverlayOptions = {};

const useStyles = makeStyles({
  root: {
    "& .MuiDataGrid-root": {
      color: "white",
    },
    "& .MuiIconButton-label": {
      color: "white",
    },
    "& .MuiTypography-body2": {
      color: "white",
    },
  },
});

function Media() {
  const classes = useStyles();
  const history = useHistory();
  const myContext = useContext(AppContext);
  let dirPath = myContext.getDirPath;
  // let listOfImages = [];
  const [listOfImages, setListOfImages] = useState([]);
  const [exportFiles, setExportFiles] = useState([]);
  const [isFilesExported, setFilesExported] = useState(false);
  const [isExportClicked, setExportClicked] = useState(false);
  const [file, setFile] = useState(null);
  const [isVideo, setVideo] = useState(false);
  const [isImage, setImage] = useState(false);
  const [src, setSrc] = useState(dirPath);

  const importAll = (r) => {
    return r.keys().map(r);
  };

  const getFileName = (file) => {
    var re = /(?:\.([^.]+))?$/;
    const fileExtension = re.exec(file)[1];
    let fileName = file.substring(file.lastIndexOf("/") + 1, file.length);
    fileName = fileName.substring(0, fileName.indexOf(".") + 1);
    return fileName + fileExtension;
  };

  const selectFiles = (events) => {
    const tempExportFiles = [];
    events.forEach((event) => {
      const fileName = getFileName(event);
      tempExportFiles.push(fileName);
    });
    setExportFiles(tempExportFiles);
  };

  const preview = async (event) => {
    console.log(event);
    await selectFiles(event);
    if (event.length === 0) {
      setFile(null);
      setImage(false);
      setVideo(false);
    } else {
      const selectedFile = event[event.length - 1];
      setFile(selectedFile);
      var re = /(?:\.([^.]+))?$/;
      const fileExtension = re.exec(selectedFile)[1];
      if (fileExtension.match(/mp4/i)) {
        setImage(false);
        setVideo(true);
      } else {
        setVideo(false);
        setImage(true);
      }
    }
  };

  const exportSlectedFiles = () => {
    exportFiles.forEach((fileName) => {
      const data = { src, fileName };
      ipcRenderer.send("export_files", data); // send request
      ipcRenderer.on("export_files", (event, data) => {
        // IPC event listener
        console.log(data); // show the response data
        if (data && fileName === exportFiles[exportFiles.length - 1]) {
          setFilesExported(true);
        } else {
          setFilesExported(false);
        }
        setExportClicked(true);
      });
    });
  };

  useEffect(() => {
    // call interval after 2 seconds (coversion to mp4 takes time)
    let interval = setInterval(() => {
      ipcRenderer.send("load-media-files", {dirName:src,serialNumber:myContext.serialNumber, userId:myContext.userId}); // send request
    }, 2000);

    ipcRenderer.on("load-media-files", (event, files) => {
      // IPC event listener
      if (files.length > 0) {
        files.sort((a, b) => {
          try {
            let timestampA = Number(a.fileName.split("-")[2].split(".")[0]);
            let timestampB = Number(b.fileName.split("-")[2].split(".")[0]);
            return timestampB - timestampA;
          } catch (e) {
            return 0;
          }
        });
        setListOfImages(files);
      }
    });

    return () => {
      // clear interval on unmount
      clearInterval(interval);
    };
  }, []);

  const selectChange = (e) => {
    console.log(e);
  };

  const goBackToMain = () => {
    history.push("/main");
  };

  return (
    <div className="App text">
      <header className="App-header">
        {/* <Link to="/">Setup</Link> */}
        {/* <input directory="" webkitdirectory="" type="file" onChange={selectChange} /> */}
        <h1 className="m-5">
          <button
            onClick={goBackToMain}
            type="button"
            className="link_button back_button"
          >
            Back
          </button>
          Media
        </h1>

        <div>
          <div
            style={{
              height: 400,
              width: "40%",
              margin: "0 auto",
              float: "left",
              marginLeft: "10px",
            }}
            className={classes.root}
          >
            {listOfImages.length > 0 ? (
              <DataGrid
                rows={listOfImages}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                checkboxSelection
                onSelectionModelChange={(e) => preview(e)}
              />
            ) : (
              <Skeleton height="500px" />
            )}
          </div>

          <div style={{ width: "50%", float: "right", margin: "0 auto" }}>
            {isVideo ? (
              <div className="fill" id="video-play">
                <video
                  className="video-wrapper1"
                  src={`file://${file}`}
                  autoPlay
                  controls
                />
              </div>
            ) : null}
            {isImage ? (
              <img className="image-preview" src={file} alt="screenshot" />
            ) : null}
          </div>
        </div>

        <div className="mt-5">
          {exportFiles && exportFiles.length > 0 ? (
            <>
              <button className="link_button" onClick={exportSlectedFiles}>
                Export
              </button>
            </>
          ) : null}
          {isExportClicked ? (
            isFilesExported ? (
              <div>
                <span> The file has been exported </span>
                <Link to="/"> Visit Setup Page </Link>
              </div>
            ) : (
              <div>
                <span>
                  {" "}
                  USB drive not mounted. Please mount a USB disk and try again.{" "}
                </span>
              </div>
            )
          ) : null}
        </div>
      </header>
    </div>
  );
}

export default Media;
