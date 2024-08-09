import './App.css';
import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import HomePage from './components/HomePage';



function App() {
  const [timeZone, setTimeZone] = useState("America/Los_Angeles");
  function handleChange(timeZone){
    // console.log(timeZone);
    setTimeZone(timeZone);
  }
  // console.log(timeZone);

  return (
        <BrowserRouter>
          <Routes>
            <Route path = '/' element = {<HomePage timeZone = {timeZone} handleChange = {handleChange}/>}/>
            <Route path = '/Hololive' element = {<HomePage queryType = "company" queryValue = "Hololive" timeZone = {timeZone} handleChange = {handleChange}/>}/>
            <Route path = '/VSPO' element = {<HomePage queryType = "company" queryValue = "VSPO" timeZone = {timeZone} handleChange = {handleChange}/>}/>
            <Route path = '/Neoporte' element = {<HomePage queryType = "company" queryValue = "Neoporte" timeZone = {timeZone} handleChange = {handleChange}/>}/>

            <Route path = '/Old' element = {<HomePage timeZone = {timeZone} streamType = "Archive" handleChange = {handleChange}/>}/>
            <Route path = '/Hololive/Old' element = {<HomePage queryType = "company" queryValue = "Hololive" streamType = "Archive" timeZone = {timeZone} handleChange = {handleChange}/>}/>
            <Route path = '/VSPO/Old' element = {<HomePage queryType = "company" queryValue = "VSPO" streamType = "Archive" timeZone = {timeZone} handleChange = {handleChange}/>}/>
            <Route path = '/Neoporte/Old' element = {<HomePage queryType = "company" queryValue = "Neoporte" streamType = "Archive" timeZone = {timeZone} handleChange = {handleChange}/>}/>
          </Routes>
        </BrowserRouter>
  );
}

export default App;
