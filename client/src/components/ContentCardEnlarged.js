import React, { useEffect, useState } from 'react'
import "./ContentCardEnlarged.css"

//this is a component that hows an enlarged version of the card
//it has more descriptive things like a full title, view count, and embedded video
function ContentCardEnlarged(props)
{
    const stream = props.stream
    console.log("in content card enlarged creator name " + stream.name + " ID " + stream.streamId);
    const [viewCount, setviewCount] = useState(null);

    const embeddedStream = "https://www.youtube.com/embed/" + stream.streamId + "?&autoplay=1"

    return(
        <>
        <div className="card" onMouseOut={props.onMouseOut}>

        </div>
            {/* <iframe className="card" src = {embeddedStream} frameBorder="0" allowFullScreen onMouseOut={props.onMouseOut}>

            </iframe> */}
        </>
    )
};

export default ContentCardEnlarged