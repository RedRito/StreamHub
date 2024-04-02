import { Link } from "react-router-dom";
import "./ContentCard.css"
//https://i.ytimg.com/vi/K4JbokXjNhg/hqdefault.jpg?sqp=-oaymwEiCMQBEG5IWvKriqkDFQgBFQAAAAAYASUAAMhCPQCAokN4AQ==&rs=AOn4CLA_dLGJes6N7x5SMtmqrIxeYRk-BA
// https://i.ytimg.com/vi/QhRxBbAGHQA/hqdefault.jpg?sqp=-oaymwEjCPYBEIoBSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=%5Cu0026rs=AOn4CLCUkHdSp4L0XaHdT1uWXiIpVlTZSQ
// https://i.ytimg.com/vi/QhRxBbAGHQA/hqdefault.jpg?sqp=-oaymwEjCNACELwBSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=%5Cu0026rs=AOn4CLCpnCcrPqQmwgSMNkNnR00_xIsV-g
// https://yt3.googleusercontent.com/WO7ItKNmy6tW_NQ82g8c1y74CZSw6GsSdynsE5s2csuEok2fHRrAaGcBV3JJO-2BxEOXXA8lvw=s176-c-k-c0x00ffffff-no-rj

const cardTime = "5:00"
const creatorName = "Koyori ch. 博衣こより"
const thumbnail = "https://i.ytimg.com/vi/QhRxBbAGHQA/hqdefault.jpg?sqp=-oaymwEjCNACELwBSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=%5Cu0026rs=AOn4CLCpnCcrPqQmwgSMNkNnR00_xIsV-g"
const icon = "https://yt3.googleusercontent.com/WO7ItKNmy6tW_NQ82g8c1y74CZSw6GsSdynsE5s2csuEok2fHRrAaGcBV3JJO-2BxEOXXA8lvw=s176-c-k-c0x00ffffff-no-rj"
const linkto = "https://www.youtube.com/watch?v=QhRxBbAGHQA"

const ContentCard = () => {
    return(
        <div className="card">
            <a href={linkto} target="_blank">
            <div className="top-card">
                <div className="card-text card-text-time">
                    {cardTime}
                </div>
                <div className="card-text card-text-name">
                    {creatorName}
                </div>
            </div>
            <div className="middle-card">
                <div className="card-image">
                    <img className = "card-image-crop" src = {thumbnail} alt="Thumbnail"/>
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