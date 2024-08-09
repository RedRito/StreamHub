import React, { useEffect, useState } from 'react'
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

    if(creatorList){
        creatorList.map((creator) => {
            // handleCreatorChange(creator);
            // console.log(creator);
            let streamTime = creator.unixTime;
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



        var yesterComponents = yesterList.map((creator) => {
            return(
                <li key={creator.streamId} className="test">
                <ContentCard
                    stream = {creator}
                    timeZone = {props.timeZone}
                    hovering = {hovering}
                    toggleHover = {toggleHover}
                />
                </li>
            )
        });

        var todayComponents = todayList.map((creator) => {
            if(!creator){
                return null;
            }
            return(
                <li key={creator.streamId} className="test">
                <ContentCard
                    stream = {creator}
                    timeZone = {props.timeZone}
                    hovering = {hovering}
                    toggleHover = {toggleHover}
                />
                </li>
            )
        })

        var tmmrComponents = tmmrList.map((creator) => {
            if(!creator){
                return null;
            }
            return(
                <li key={creator.streamId} className="test">
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

    function firstDay(){
        return( 
            <DateBar DateTime = {yesterDate}/>
        )
    }
    function secondDay(){
        return(
            <DateBar DateTime = {todayDate}/>
        )
    }

    function thirdDay(){
        return(
            <DateBar DateTime = {tmmrDate}/>
        )
    }

    function streamsList(){
        let first = null;
        let second = null;
        let third = null;

        if(yesterList && yesterList.length){
            first = firstDay()
        }
        if(todayList && todayList.length){
            second = secondDay()
        }
        if(tmmrList && tmmrList.length){
            third = thirdDay()
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
        // else console.log(yesterComponents);


    }

    return(
        <div>
            {streamsList()}
        </div>
    )};


export default ContentList