import './App.css';
import React, { useState } from 'react'
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import HomePage from './components/HomePage';



function App() {

  const initalTimeZone = checkExistingCookie() ? getTimeZoneCookie() : "America/Los_Angeles";
  const [timeZone, setTimeZone] = useState(initalTimeZone);
  function handleChange(timeZone){
    setTimeZone(timeZone);
  }

  //document.cookie = "timeZone=" + timeZone + ";" + "SameSite=lax;max-age=max-age-in-seconds;";
  //document.cookie.split(";").map((item) => console.log(item.trim().startsWith("timeZone=")));
  function checkExistingCookie(){
    if(document.cookie.split(";").some((item) => item.trim().startsWith("timeZone=")))
    {
      return true;
    }
    else return false
  }

  function createTimeZoneCookie(){
    document.cookie = "timeZone=" + timeZone + ";" + "SameSite=lax;max-age=max-age-in-seconds;";
  }

  if(!checkExistingCookie()) createTimeZoneCookie();

  function getTimeZoneCookie(){
    const timeZone = document.cookie
                             .split("; ")
                             .find((row) => row.startsWith("timeZone="))
                             ?.split("=")[1];
    return timeZone
  }
  
  //setTimeZone(getTimeZoneCookie());

  return (
        <BrowserRouter>
          <Routes>
            <Route path = '/' element = {<HomePage timeZone = {timeZone} handleChange = {handleChange}/>}/>
            <Route path = '/Hololive' element = {<HomePage queryType = "company" queryValue = "Hololive" timeZone = {timeZone} handleChange = {handleChange}/>}/>
            <Route path = '/VSPO' element = {<HomePage queryType = "company" queryValue = "VSPO" timeZone = {timeZone} handleChange = {handleChange}/>}/>
            <Route path = '/Neoporte' element = {<HomePage queryType = "company" queryValue = "Neoporte" timeZone = {timeZone} handleChange = {handleChange}/>}/>
            <Route path = '/Other' element = {<HomePage queryType = "company" queryValue = "Other" timeZone = {timeZone} handleChange = {handleChange}/>}/>

            <Route path = '/Vods' element = {<HomePage timeZone = {timeZone} streamType = "Archive" handleChange = {handleChange}/>}/>
            <Route path = '/Hololive/Vods' element = {<HomePage queryType = "company" queryValue = "Hololive" streamType = "Archive" timeZone = {timeZone} handleChange = {handleChange}/>}/>
            <Route path = '/VSPO/Vods' element = {<HomePage queryType = "company" queryValue = "VSPO" streamType = "Archive" timeZone = {timeZone} handleChange = {handleChange}/>}/>
            <Route path = '/Neoporte/Vods' element = {<HomePage queryType = "company" queryValue = "Neoporte" streamType = "Archive" timeZone = {timeZone} handleChange = {handleChange}/>}/>
            <Route path = '/Other/Vods' element = {<HomePage queryType = "company" queryValue = "Other" streamType = "Archive" timeZone = {timeZone} handleChange = {handleChange}/>}/>
          </Routes>
        </BrowserRouter>
  );
}

export default App;
