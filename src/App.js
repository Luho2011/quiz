import React from 'react';
import {useState, useEffect } from "react";
import './App.css';
import axios from 'axios';
import HomeScreen from './HomeScreen';
import Celeb from './pages/Celeb';
import Music from './pages/Music';
import Belong from './pages/Belong';
import Zoom from './pages/Zoom';
import Movie from './pages/Movie';
import Theme from './pages/Theme';
import Movie2 from './pages/Movie2';
import MovieDetails from './pages/MovieDetails';
import Claim from './pages/Claim';
import WhoKnowsMore from './pages/WhoKnowsMore';
import Nav from './Nav';
import History from './pages/History';
import Hitster from './pages/Hitster';
import PlaylistSetupHitster from './pages/PlaylistSetupHitster';
import Association from './pages/Association';
import Auth from './Auth';
import Callback from './Callback';
import { Route, Routes } from "react-router-dom"; 
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend"

function App() {
 

  return (
    
        <div className="app">
          <Routes>
            <Route exact path='/' element={<HomeScreen />} />
            <Route path='/celeb' element={<Celeb />} />
            <Route path='/music' element={<Music />} />
            <Route path='/belong' element={<Belong />} />
            <Route path='/zoom' element={<Zoom />} />
            <Route path='/history' element={<History />} />
            <Route path='/movies' element={<Movie />} />
            <Route path='/theme' element={<Theme />} />
            <Route path='/movies2' element={<Movie2 />} />
            <Route path="/:id" element={<MovieDetails />} />
            <Route path="/claim" element={<Claim />} />
            <Route path="/whoKnowsMore" element={<WhoKnowsMore />} />
            <Route path="/playlistSetupHitster" element={<PlaylistSetupHitster />} />
            <Route path="/association" element={<Association />} />
            <Route path="/spotifyAuth" element={<Auth />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="/hitster" element={<Hitster />} />
          </Routes>
        </div>
       
   
  );
}

export default App;
