import React, { useEffect, useState, useRef } from 'react'
import "./ContentCard.css"

function ContentCard(props){
    const stream = props.stream;
    const maxNameLength = 7;
    let creatorName = stream.name.slice(stream.name.indexOf("@") + 1);
    
    const thumbnail = stream.thumbnail
    const icon = stream.icon
    const views = stream.amount
    let type = (stream.watching) ? "watching" : (stream.waiting) ? "waiting" : ""
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
                <div className="card-views">
                    <div className="card-text card-text-views">
                        {views + " " + type} 
                    </div>
                </div>
            </div>
            </a>
        </div>
        )
    }

    return(
        card()
    )
};

export default ContentCard