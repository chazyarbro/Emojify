import {useEffect, useState} from "react";
import SpotifyWebApi from "spotify-web-api-js"
import Topnav from "./TopNav";
import "./LandingPage.css"

const spotifyApi = new SpotifyWebApi();

function LandingPage() {
    const CLIENT_ID = "dbd82d7b2dc946978848f94bd9732732"
    const REDIRECT_URI = "http://localhost:3000/Home"
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
    const RESPONSE_TYPE = "token"

    useEffect(() => {
        window.sessionStorage.clear()
        window.localStorage.clear()

    })

    return (
        <div>
            <div>
                <Topnav></Topnav>
            </div>
            <div className={"loginButton"}>
                    <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&show_dialog=true&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private user-top-read`}>
                    LOGIN TO SPOTIFY</a>
            </div>
        </div>

    );
}


export default LandingPage;