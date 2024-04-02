import React, { useEffect, useState } from 'react'
import { Link } from "react-router-dom";
import "./ContentList.css"
import ContentCard from "./ContentCard";

const arr = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15, 16, 17];

const listComponents = arr.map((val) => {
    return(
        <li key={val} className="test">
        <ContentCard/>
        </li>
    )
});

const ContentList = () => {

    const [creatorList, setCreatorList] = useState(null);
    


    return(
        <div>
            <ul className="list-size">
                {listComponents}
            </ul>
            <ul className="list-size">
                {listComponents}
            </ul>
        </div>
    )};


export default ContentList