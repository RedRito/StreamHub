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
          </Routes>
        </BrowserRouter>
  );
}

export default App;
