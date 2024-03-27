import {useEffect, useState} from "react";
import SpotifyWebApi from "spotify-web-api-js"
import Topnav from "./TopNav";
import { Stage, Layer, Rect, Text, Circle, Line } from 'react-konva';
import { useNavigate } from "react-router-dom";
import "./HomePage.css"
const spotifyApi = new SpotifyWebApi();

function HomePage() {
    const [token, setToken] = useState("")

    const [username, setUsername] = useState("")

    const [genreNames, setGenreNames] = useState([])
    const [genrePercents, setGenrePercents] = useState([])

    const [emotions, setEmotions] = useState([])


    let navigate = useNavigate();
    const handleSubmit = () =>{
        let path = `/Results`;
        navigate(path);
    }

    let SCENE_BASE_WIDTH = 800;
    let SCENE_BASE_HEIGHT = 600;

    const [size, setSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    useEffect(() => {
        const checkSize = () => {
          setSize({
            width: window.innerWidth,
            height: window.innerHeight
          });
        };
        document.documentElement.style.overflow = 'hidden';  // firefox, chrome
        window.addEventListener("resize", checkSize);
        return () => window.removeEventListener("resize", checkSize);
    }, []);

    // do your calculations for stage properties
    const scale = size.width / SCENE_BASE_WIDTH;

    useEffect(() => {
        document.title = "App"
        const hash = window.location.hash
        let token = window.sessionStorage.getItem("token")

        if(!token && hash) {
            token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]
            window.location.hash = ""
            window.sessionStorage.setItem("token", token)
        }
        setToken(token)
        spotifyApi.setAccessToken(token)

        if(token) {
            spotifyApi.getMe().then((user) => {
                setUsername(user.id)
            })
        }

    }, [])


    const logout = () => {
        setToken("")
        window.sessionStorage.setItem("token", "")
        window.location="/"
    }

    function onChangeValue(event) {
        console.log(event.target.value)
        window.sessionStorage.setItem("time", event.target.value)
    }

    return (
        <div>
            <div>
                <Topnav></Topnav>
            </div>
            <h1>HELLO {username}</h1>
            <button onClick={logout}>Logout</button>
            <button onClick={handleSubmit}>Get My Artists</button>
            <div className="container">
                <div className="selector" onChange={onChangeValue}>
                    <div className="selector-item">
                        <input type="radio" id="radio1" name="selector" className="selector-item_radio" value="short_term" />
                        <label for="radio1" className="selector-item_label">Last Month</label>
                    </div>
                    <div className="selector-item">
                        <input type="radio" id="radio2" name="selector" className="selector-item_radio" value="medium_term" />
                        <label for="radio2" className="selector-item_label">Last 6 Months</label>
                    </div>
                    <div className="selector-item">
                        <input type="radio" id="radio3" name="selector" className="selector-item_radio" value="long_term" />
                        <label for="radio3" className="selector-item_label">All Time</label>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default HomePage;