import './App.css';
import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import HomePage from './components/HomePage';



function App() {
  const [timeZone, setTimeZone] = useState("UTC");
  function handleChange(timeZone){
    // console.log(timeZone);
    setTimeZone(timeZone);
  }
  // console.log(timeZone);

  return (
        <BrowserRouter>
          <Routes>
            <Route path = '/' element = {<HomePage timeZone = {timeZone} handleChange = {handleChange}/>}/>
            <Route path = '/Hololive' element = {<HomePage queryType = "name" queryValue = "/@NatsuiroMatsuri"/>}/>
          </Routes>
        </BrowserRouter>
  );
}

export default App;
