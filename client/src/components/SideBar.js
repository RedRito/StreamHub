import { Link } from "react-router-dom";
import React, { useEffect, useState } from 'react'
import "./SideBar.css"
import useWindowDimensions from "./WindowDimensions";

function SideBar(props){
    const { height, width } = useWindowDimensions();

    const [sideBar, setSideBar] = useState(true);

    function changeTimeZone(event)
    {
        props.handleChange(event.target.value);
    }
    // pass this function as props to children, this would be the burger button or something similar
    // essentially when screensize is sidebar size + contentList size toggle sidebar to close
    // at this same screen size the burger button or some other icon will display to show the sidebar
    // this function will be passed to the button and onClick() will call this function
    function toggleSideBar()
    {
        setSideBar(!sideBar);
        // console.log("SIDEBAR IS " + sideBar);
    }

    let timeZoneArr = Intl.supportedValuesOf('timeZone');
    
    let timeZones = timeZoneArr.map((timeZone) => {
        return(
            <option value={timeZone}>
                {timeZone}
            </option>
        )
    })

    // <button className={sideBar ? "buttonClicked" : "button"} onClick={toggleSideBar}>
    //             X
    //     </button>

    return(
        <>
        <button className={sideBar ? "cross" : "cross-clicked"} onClick={toggleSideBar}/>
            
        <div className= {(width >= 1600) ? "sideBarBody" : sideBar ? "sideBarBodyHidden" : "sideBarBodyNotHidden"}>
            <ul>
                <li className="listBox"> 
                    <Link to = '/'>
                        <span className="text">
                            All
                        </span>
                    </Link>
                </li>
                <li className="listBox">
                    <Link to = '/Hololive'>
                        <span className="text">
                            HOLOLIVE
                        </span>
                    </Link>
                </li>
                <li className="listBox">
                    <Link to = '/VSPO'>
                        <span className="text">
                            VSPO!
                        </span>
                    </Link>
                </li>
                <li className="listBox">
                    <Link to = '/KUROSANJI'>
                        <span className="text">
                            KUROSANJI
                        </span>
                    </Link>
                </li>
                <li className="listBox">
                    <Link to = '/Neoporte'>
                        <span className="text">
                            NEOPORTE
                        </span>
                    </Link>
                </li>
                <li className="listBox">
                    <form className="form">
                        <span className="text">
                            TIMEZONE
                        </span>
                        <select value={props.timeZone} onChange={changeTimeZone} className="dropdown">
                            {timeZones}
                        </select>
                    </form>
                </li>
            </ul>
        </div>
        </>
    )
}

export default SideBar