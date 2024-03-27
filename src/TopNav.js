import {useEffect, useState} from "react";
import "./Topnav.css";
import logo from "./git.svg"
import {TiInfoLargeOutline } from "react-icons/ti";


const togglePopup = () => {
    document.getElementById("infoPopup").classList.toggle("active");
}

const goToSocial = () => {
    window.open(
  'https://github.com/chazyarbro',
  '_blank' // <- This is what makes it open in a new window.
    );
}

function Topnav() {
    return (
        <div id="topnavContainer">
            <button className={"infoIconButton"} onClick={togglePopup}>
                <TiInfoLargeOutline className={"infoIcon"} size={42}/>
            </button>
            <h1 className={"title"}>Emojify</h1>
            <div className={"popup"} id={"infoPopup"}>
                <div className={"overlay"}></div>
                <div className={"content"}>
                    <div className={"close-btn"} onClick={togglePopup}>&times;</div>
                    <h1>Created by: </h1>
                    <p>Chaz Yarbrough</p>
                    <input className={"socialLogo"} type="image" src={logo} onClick={goToSocial}/>
                </div>
            </div>
        </div>

    );
}

export default Topnav;