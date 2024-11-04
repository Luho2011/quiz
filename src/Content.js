import React from 'react'
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
    </div>
  )
}

export default Content