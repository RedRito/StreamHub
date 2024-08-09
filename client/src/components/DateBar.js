import React, { useEffect, useState } from 'react'
import "./DateBar.css"
import { DateTime } from "luxon";

const DateBar = (props) => {
    let date = props.DateTime.toFormat('MM/dd');
    return(
        <>
        <div className="cardsss">
            <div className="barMiddle">
                <div className="middleText">
                    {date}
                </div>
            </div>
        </div>
        </>
    )
}

export default DateBar