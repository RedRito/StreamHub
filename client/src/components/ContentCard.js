import { Link } from "react-router-dom";
import "./ContentCard.css"
//https://i.ytimg.com/vi/K4JbokXjNhg/hqdefault.jpg?sqp=-oaymwEiCMQBEG5IWvKriqkDFQgBFQAAAAAYASUAAMhCPQCAokN4AQ==&rs=AOn4CLA_dLGJes6N7x5SMtmqrIxeYRk-BA
// https://i.ytimg.com/vi/QhRxBbAGHQA/hqdefault.jpg?sqp=-oaymwEjCPYBEIoBSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=%5Cu0026rs=AOn4CLCUkHdSp4L0XaHdT1uWXiIpVlTZSQ
// https://i.ytimg.com/vi/QhRxBbAGHQA/hqdefault.jpg?sqp=-oaymwEjCNACELwBSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=%5Cu0026rs=AOn4CLCpnCcrPqQmwgSMNkNnR00_xIsV-g
// https://yt3.googleusercontent.com/WO7ItKNmy6tW_NQ82g8c1y74CZSw6GsSdynsE5s2csuEok2fHRrAaGcBV3JJO-2BxEOXXA8lvw=s176-c-k-c0x00ffffff-no-rj
// const cardTime = stream.unixTime.toString();
//     const creatorName = stream.name
//     const thumbnail = stream.thumbnail
//     const icon = stream.icon
//     const linkto = "https://www.youtube.com/watch?" + stream.streamId;



function ContentCard(props){
    const stream = props.stream;
    // const timeZone = props.timeZone;
    const maxNameLength = 7;

    const creatorName = (stream.canonicalName.length > maxNameLength) ? stream.canonicalName.slice(0, maxNameLength) : stream.canonicalName;
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

    return(
        <div className="card">
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