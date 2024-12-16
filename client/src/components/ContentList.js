import React, { useEffect, useState, useRef } from 'react'
import { DateTime } from "luxon";
import { Link } from "react-router-dom";
import "./ContentList.css"
import ContentCard from "./ContentCard.js";
import DateBar from './DateBar.js';


const ContentList = (props) => {
    const [creatorList, setCreatorList] = useState(null);
    const [hovering, setHovering] = useState(false);

    const toggleHover = () => {
        setHovering(!hovering);
    }
    
    useEffect(() => {
        fetchData();
    }, [props]);

    function fetchData(){
        let headers = new Headers();
        headers.append("Content-Type", "application/json");
        
        let requestOptions = {
            method: 'GET',
            headers: headers
        };
        let fetchQuery = {};
        if(props.streamType){
            fetchQuery['streamType'] = props.streamType;
            requestOptions.method = 'POST';
            requestOptions.body = JSON.stringify(fetchQuery);
        }
        if(props.queryType && props.queryValue) {
            fetchQuery['queryType'] = props.queryType;
            fetchQuery['queryValue'] = props.queryValue;
            requestOptions.method = 'POST';
            requestOptions.body = JSON.stringify(fetchQuery);
        }


        fetch("http://localhost:3001/home", requestOptions)
        .then(res => res.json())
        .then(res => {
            // console.log(res);
            setCreatorList(res);
        })
        .catch((err) => {console.log(err)});

    }

    var todayList = [];
    var tmmrList = [];
    var yesterList = [];

    
    let date = DateTime.now().setZone(props.timeZone);
    let today = date.startOf('day').toMillis() / 1000;
    let todayDate = date.startOf('day');
    let tmmr = date.plus({ days: 1 }).startOf('day').toMillis() / 1000;
    let tmmrDate =  date.plus({ days: 1 }).startOf('day');

    let dayAfter = date.plus({ days: 2 }).startOf('day').toMillis() / 1000;
    let yester = date.plus({ days: -1 }).startOf('day').toMillis() / 1000;
    let yesterDate = date.plus({ days: -1 }).startOf('day');

    let currentStream;  // Current Closest Stream in Unix Time

    function getCurrentTime(){
        return Math.floor(Date.now() / 1000);
    }

    function findClosestStream(streamTimes){
        
    }

    if(creatorList){

        let currTime = getCurrentTime();
        let streamTimes = [];

        creatorList.map((creator) => {
            let streamTime = creator.unixTime;
            streamTimes.push(streamTime); //used for calculating closest stream
            if(streamTime >= dayAfter){
            }
            else if(streamTime >= tmmr){
                tmmrList.push(creator);
            }
            else if(streamTime >= today){
                todayList.push(creator);
            }
            else if(streamTime >= yester){
                yesterList.push(creator);
            }
        });

        //find curr closest stream
        currentStream = streamTimes.reduce(function(prev, curr){
            return (Math.abs(curr - currTime) < Math.abs(prev - currTime) ? curr : prev);
        });

        var yesterComponents = returnListComponentGivenDay(yesterList)

        var todayComponents = returnListComponentGivenDay(todayList);

        var tmmrComponents = returnListComponentGivenDay(tmmrList);
    }

    function returnListComponentGivenDay(dayList){

        if(!dayList && !dayList.length) return;

        return dayList.map((creator) => {
            if(!creator){
                return null;
            }
            let id = null;
            if(creator.unixTime == currentStream) id = "currentStream";
            return(
                <li key={creator.streamId} id={id} className="test">
                <ContentCard
                    stream = {creator}
                    timeZone = {props.timeZone}
                    hovering = {hovering}
                    toggleHover = {toggleHover}
                />
                </li>
            )
        })
    }

    function returnDayBar(date, id){
        return(
            <DateBar DateTime = {date} id = {id}/>
        )
    }

    function streamsList(){
        let first = null;
        let second = null;
        let third = null;

        if(yesterList && yesterList.length){
            first = returnDayBar(yesterDate, null);
        }
        if(todayList && todayList.length){
            second = returnDayBar(todayDate, "today");
        }
        if(tmmrList && tmmrList.length){
            third = returnDayBar(tmmrDate, null);
        }

        return(
            <ul className="list-size">
                {first}
                {yesterComponents}
                {second}
                {todayComponents}
                {third}
                {tmmrComponents}
            </ul>
        )
    }

    
    var el = document.getElementById("currentStream") ? document.getElementById("currentStream") : document.getElementById("today");
    if(el){
        let scrollOptions = {
            behavior: 'smooth',
            block: 'start'
        }
        el.scrollIntoView(scrollOptions);
    }

    return(
        <div>
            {streamsList()}
        </div>
    )};


export default ContentList