import { Link } from "react-router-dom";
import React, { useEffect, useState, useRef } from 'react'
import "./ContentCard.css"
import ContentCardEnlarged from './ContentCardEnlarged.js';
import TransparentCover from "./TransparentCover.js";




function ContentCard(props){
    const [isHovering, setIsHovering] = useState(false);
    let cardRef = useRef(null);
    let timeOut = null;
    const stream = props.stream;
    const maxNameLength = 7;
    let creatorName = stream.name.slice(stream.name.indexOf("@") + 1);
    
    const thumbnail = stream.thumbnail
    const icon = stream.icon
    const linkto = "https://www.youtube.com/watch?v=" + stream.streamId;
    const location = "en-US"
    const options = {
        hour: "numeric",
        minute: "numeric",
        hour12: false,
        timeZone: props.timeZone
    }
    const date = new Intl.DateTimeFormat({location}, options).format(new Date(stream.unixTime * 1000));

    const spliceCreatorName = () => {
        if(stream.canonicalName){
            if(stream.canonicalName.length > maxNameLength){
                stream.canonicalName = stream.canonicalName.slice(0, maxNameLength);
            }
            if(stream.canonicalName.includes("/") || stream.canonicalName.includes(" ")){
                var splice = Math.min(stream.canonicalName.indexOf("/"), stream.canonicalName.indexOf(" "));
                stream.canonicalName = stream.canonicalName.slice(0, splice);
            }
            return stream.canonicalName;
        }
        return "";
    }

    const name = stream.canonicalName ? spliceCreatorName() : creatorName;

    // const handleMouseOver = (event) => {
    //     console.log(cardRef.current);
    //     console.log(event.target);
    //     // if(cardRef.current.contains(event.target)){
    //     //     console.log("HI");
    //     // }
    //     if(!props.hovering){
    //         if(cardRef.current.contains(event.target)){
    //             props.toggleHover();
    //             timeOut = setTimeout(() => setIsHovering(true), 1000);
    //         }
    //         else{
    //             clearTimeout(timeOut);
    //             setIsHovering(false);
    //         }
    //     }
    //     else{
    //         clearTimeout(timeOut);
    //         setIsHovering(false);
    //     }
    //     //setIsHovering(true);
    // };
    
    // const handleMouseOut = () => {
    //     if(props.hovering){
    //         props.toggleHover();
    //     }
    //     clearTimeout(timeOut);
    //     setIsHovering(false);
    // };

    // {isHovering && <ContentCardEnlarged stream = {creator} handleMouseOut = {handleMouseOut}/>}
    
    const card = function(){
        return(
            <div className={stream.watching ? "cardPlaying" : "card"}>
            <a href={linkto} target="_blank">
            <div className="top-card">
                <div className="card-text card-text-time">
                    {date}
                </div>
                <div className="card-text card-text-name">
                    {name}
                </div>
            </div>
            <div className="middle-card">
                <div >
                    <img className="card-image" src = {thumbnail} alt="Thumbnail"/>
                </div>
            </div>
            <div className="bottom-card">
                <div className="card-icon-border">
                    <img className = "card-icon" src = {icon} alt = "Icon"/>
                </div>
            </div>
            </a>
        </div>
        )
    }

    // const hoveringCard = function(){
    //     return(
    //         <div>
    //         <TransparentCover onMouseOut = {handleMouseOut} hovering = {props.hovering}/>
    //         <ContentCardEnlarged stream = {stream} onMouseOut = {handleMouseOut} hovering = {props.hovering}/>
    //         </div>
    //     )
    // }

    return(
        //(isHovering) ? hoveringCard() : card()
        card()
    )
};

export default ContentCard