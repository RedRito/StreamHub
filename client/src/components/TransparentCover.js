import React, { useEffect, useState } from 'react'
import "./TransparentCover.css"

function TransparentCover(props){
    return(
        <div className="hoverCover" onClick={props.handleMouseOut}>

        </div>
    )
}

export default TransparentCover