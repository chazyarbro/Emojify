import {useEffect, useState} from "react";
import SpotifyWebApi from "spotify-web-api-js"
import Topnav from "./TopNav";
import { Stage, Layer, Rect, Text, Circle, Line } from 'react-konva';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import "./ResultsPage.css"
const spotifyApi = new SpotifyWebApi();

function ResultsPage() {

    const [genreNames, setGenreNames] = useState([])
    const [genrePercents, setGenrePercents] = useState([])
    const [emotions, setEmotions] = useState([])
    const [quote, setQuote] = useState([])

    let quoteCount = 0

    let SCENE_BASE_WIDTH = 800;
    let SCENE_BASE_HEIGHT = 600;

    const [size, setSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });
    
    let token = window.sessionStorage.getItem("token")
    
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
        if(token) {
            console.log(token)
            spotifyApi.setAccessToken(token)
        }

        let genreDict = {}
        let songDict = {}

        let time = window.sessionStorage.getItem("time")
        if (time === null){
            time = "short_term"
        }

        console.log(time)

        const fetchData = async () => {
            await spotifyApi.getMyTopArtists({ limit: 5 }).then((response) => {
                for(let i = 0; i < response.items.length; ++i){
                   addToGenreDict(response.items[i].genres, genreDict)
                }
            })
    
            await spotifyApi.getMyTopTracks({time_range: time, limit: 20}).then((response) => {
                for(let i = 0; i < response.items.length; ++i)
                    {
                        if(songDict[response.items[i].artists[0].name]) {
                            songDict[response.items[i].artists[0].name].push(response.items[i].name)
                        }
                        else {
                            songDict[response.items[i].artists[0].name] = [response.items[i].name]
                        }
                    }
            })
    
            await fetch("/quote", {
                method: 'POST',
                body: JSON.stringify(songDict)
            }).then((response) => response.json())
                .then((data) => printQuotes(data))
    
            
            await fetch("/lyrics", {
                method: 'POST',
                body: JSON.stringify(songDict)
            }).then((response) => response.json())
                .then((data) => buildEmotionList(data))
        }
        
        fetchData()
            .catch(console.error)
    },[])


    const addToGenreDict = async (genre, genreDict) => {
      genre.forEach(genre => {
        genreDict[genre] = (genreDict[genre] || 0) + 1;
      });
      return genreDict;
    }

    
    function printQuotes(quotes) {
        setQuote(quotes[quoteCount])
        quoteCount++
        const myInterval = setInterval(function () {
            setQuote(quotes[quoteCount])

            if(++quoteCount === 5) {
                clearInterval(myInterval)
            }
        }, 5000)
    }

    function buildGenreList(names, percents){
        setGenreNames(names)
        setGenrePercents(percents)
    }

    function buildEmotionList(emotionsDict){
        setEmotions(emotionsDict)
        console.log(emotionsDict)
    }

    return (
        <div>
            <div>
                <Topnav></Topnav>
            </div>
            {emotions.length !== 0  ? 
            (
                <div>
                    <img src={`/emojis/${emotions[0][0]}.png`}></img>
                    <img src={`/emojis/${emotions[1][0]}.png`}></img>
                    <img src={`/emojis/${emotions[2][0]}.png`}></img>
                    <img src={`/emojis/${emotions[3][0]}.png`}></img>
                    <img src={`/emojis/${emotions[4][0]}.png`}></img>
                    <img src={`/emojis/${emotions[5][0]}.png`}></img>
                    <img src={`/emojis/${emotions[6][0]}.png`}></img>
                    <img src={`/emojis/${emotions[7][0]}.png`}></img>
                    <img src={`/emojis/${emotions[8][0]}.png`}></img>
                    <img src={`/emojis/${emotions[9][0]}.png`}></img>
                </div>
            ) : 
            (
                <div id="LoadingContainer">
                    <ActivityIndicator size="large" />
                    <h3 id="quote">{quote}</h3>
                </div>
            )
        }
        </div>
    );
}


export default ResultsPage;