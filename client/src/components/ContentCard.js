import { Link } from "react-router-dom";
import React, { useEffect, useState } from 'react'
import "./ContentCard.css"
import ContentCardEnlarged from './ContentCardEnlarged.js';




function ContentCard(props){
    const [isHovering, setIsHovering] = useState(false);
    let timeOut = null;
    const stream = props.stream;
    const maxNameLength = 7;
    let creatorName = stream.name;
    if(stream.canonicalName) creatorName = (stream.canonicalName.length > maxNameLength) ? stream.canonicalName.slice(0, maxNameLength) : stream.canonicalName;
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

    const divRef = React.useRef<HTMLDivElement>(null);
    const divNode = divRef.current;

    const handleMouseOver = () => {
        timeOut = setTimeout(() => setIsHovering(true), 1000);
        //setIsHovering(true);
    };
    
    const handleMouseOut = () => {
        clearTimeout(timeOut);
        setIsHovering(false);
    };

    // {isHovering && <ContentCardEnlarged stream = {creator} handleMouseOut = {handleMouseOut}/>}
    
    return(
        (isHovering) ? (<ContentCardEnlarged stream = {stream} onMouseOut = {handleMouseOut}/>) :
        <div className={stream.watching ? "cardPlaying" : "card"} onMouseOver={handleMouseOver}>
            <a href={linkto} target="_blank">
            <div className="top-card">
                <div className="card-text card-text-time">
                    {date}
                </div>
                <div className="card-text card-text-name">
                    {creatorName}
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
};

export default ContentCard
// on hover 
{/* <div className="scroll">
                <div className="m-scroll">
                    <span>
                    【a Difficult game about Climbing】I must become the mountain 🎼
                    </span>
                    <span>
                    【a Difficult game about Climbing】I must become the mountain 🎼
                    </span>
                </div>
        </div>        */}