import React from 'react'
import {useState, useEffect } from "react";
import './Content.css'
import { Link } from "react-router-dom";
import questionmark from "./img/question.png";
import rewindlogo from "./img/rewind.png";
import geo from "./img/geo.png";
import Sort from "./img/sort.png";
import Globe from "./img/globe.png";
import Movie from "./img/movie.png";
import belong from "./img/belong.png";
import theme from "./img/theme.png";
import Movie2 from "./img/movie2.png";
import Claim from "./img/claim.png";
import WhoKnowsMore from "./img/whoknowsmore.png";
import musicTrivia from "./img/audioIcon.png";
import WordsAssociation from "./img/wordsAssociation.png";


function Content() {
  const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=dc7167f21f264a89aafe40360bc1e358&response_type=token&redirect_uri=https://celeb-quiz.vercel.app/callback&scope=streaming user-read-playback-state user-modify-playback-state`;


useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');

    if (accessToken) {
        localStorage.setItem('spotifyAccessToken', accessToken);
        // Optional: URL-Hash leeren, um Token aus der URL zu entfernen
        window.location.hash = '';
    }
}, []);

const handleLogin = () => {
  window.location.href = AUTH_URL;
};

  return (
    <div className='content'>
       <div className='game_buttons'>
        <Link to='/celeb' target="_blank">
          <button className='game_button'><img className='questionmark_logo' src={questionmark} alt="" onClick={""}/></button>
        </Link>
        <Link to='/music' target="_blank">
          <button className='game_button'><img className='rewind_logo' src={rewindlogo} alt="" onClick={""}/></button>
        </Link>
        <Link to='/belong' target="_blank">
          <button className='game_button'><img className='geo_logo' src={belong} alt="" onClick={""}/></button>
        </Link>
        <Link to='/zoom' target="_blank">
          <button className='game_button'><img className='sort_logo' src={Sort} alt="" onClick={""}/></button>
        </Link>
        <Link to='/history' target="_blank">
          <button className='game_button'><img className='sort_logo' src={Globe} alt="" onClick={""}/></button>
        </Link>
        <Link to='/movies' target="_blank">
          <button className='game_button'><img className='movie_logo' src={Movie} alt="" onClick={""}/></button>
        </Link>
        <Link to='/theme' target="_blank">
          <button className='game_button'><img className='rewind_logo' src={theme} alt="" onClick={""}/></button>
        </Link>
        <Link to='/movies2' target="_blank">
          <button className='game_button'><img className='movie2_logo' src={Movie2} alt="" onClick={""}/></button>
        </Link>
        <Link to='/Claim' target="_blank">
          <button className='game_button'><img className='claim_logo' src={Claim} alt="" onClick={""}/></button>
        </Link>
        <Link to='/WhoKnowsMore' target="_blank">
          <button className='game_button'><img className='whoknowsmore' src={WhoKnowsMore} alt="" onClick={""}/></button>
        </Link>
        <Link to='/musicTrivia' target="_blank">
          <button className='game_button'><img className='musicTrivia' src={musicTrivia} alt="" onClick={""}/></button>
        </Link>
        <Link to='/association' target="_blank">
          <button className='game_button'><img className='musicTrivia' src={WordsAssociation} alt="" onClick={""}/></button>
        </Link>
       </div>
       <div>
            <h1>Willkommen zu meiner Spotify App</h1>
            <button onClick={handleLogin}>Mit Spotify anmelden</button>
        </div>
    </div>
  )
}

export default Content