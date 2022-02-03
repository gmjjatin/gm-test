import React, { useState }  from 'react';
import { HashRouter } from 'react-router-dom'

import { Switch, Route} from "react-router-dom";

import SetupScreen from './components/SetupScreen';
import Main from './components/MainScreen';
import Media from './components/Media';
import AppContext from './components/AppContext';

import './App.css';
function App() {
  const [serialNumber, setSerialNumber] = useState('');
  const [userId, setUserId] = useState('');
  const [url, setUrl] = useState('');
  const [getDirPath, setDirPath ] = useState('');
  const [selectedSSID, selectSSID ] = useState('');
  const [SSIDpwd, setSSIDpwd ] = useState('');
  const userSettings = {
    serialNumber: serialNumber,
    userId: userId,
    url, 
    getDirPath,
    selectedSSID,
    SSIDpwd,
    setUrl,
    setSerialNumber,
    setUserId,
    setDirPath,
    setSSIDpwd,
    selectSSID
  };

  return (
    <AppContext.Provider value={userSettings}>
      <div>
          <HashRouter>
            <Switch>
              <Route exact path="/" component={SetupScreen} />
              <Route path="/main" component={Main} />
              <Route path="/media" component={Media} />
            </Switch>
          </HashRouter>
      </div>
    </AppContext.Provider>
  );
}

export default App;
