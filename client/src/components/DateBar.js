import React, { useEffect, useState } from 'react'
import "./DateBar.css"
const DateBar = (props) => {
    let date = props.DateTime.toFormat('MM/dd');
    let id = null
    if(props.id) id = props.id
    return(
        <>
        <div className="bar" id={id}>
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