import React, { useEffect, useState } from 'react'
import { Link } from "react-router-dom";
import "./ContentList.css"
import ContentCard from "./ContentCard";

const arr = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15, 16, 17];


const ContentList = (props) => {
    // console.log("IN CONTENTLIST " + props.queryType + props.queryValue);
    const [creatorList, setCreatorList] = useState(null);

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
        let fetchQuery = null;
        if(props.queryType && props.queryValue) {
            fetchQuery = {
                queryType: props.queryType,
                queryValue: props.queryValue
            }
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

    if(creatorList){
        var listComponents = creatorList.map((creator) => {
            // console.log(creator);
            return(
                <li key={creator.streamId} className="test">
                <ContentCard
                    stream = {creator}
                    timeZone = {props.timeZone}
                />
                </li>
            )
        });
    }


    return(
        <div>
            <ul className="list-size">
                {listComponents}
            </ul>
        </div>
    )};


export default ContentList