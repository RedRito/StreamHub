import { Link } from "react-router-dom";
import React, { useEffect, useState } from 'react'
import "./HomePage.css"
import ContentList from "./ContentList";
import TopBar from "./TopBar";
import SideBar from "./SideBar"


const HomePage = (props) => { 
    let queryType = null
    let queryValue = null
    // console.log(props);
    if(props.queryType && props.queryValue){
        queryType = props.queryType;
        queryValue = props.queryValue;
    }
    
    return(
        <div className="body">
            <TopBar/>
            <SideBar timeZone = {props.timeZone} handleChange = {props.handleChange}/>
            <ContentList queryType = {queryType} queryValue = {queryValue} timeZone = {props.timeZone}/>
        </div>
    )};


export default HomePage