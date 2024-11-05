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
import MusicTrivia from './pages/MusicTrivia';
import MusicTriviaGame from './pages/MusicTriviaGame';
import Association from './pages/Association';
import RoomPage from "./pages/RoomPage";
import Auth from './Auth';
import Callback from './Callback';
import { Route, Routes } from "react-router-dom"; 
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend"

function App() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Token aus URL extrahieren und speichern
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');

    if (accessToken) {
        localStorage.setItem('spotifyAccessToken', accessToken);
        // Weiterleitung auf die App-Hauptseite ohne Token in der URL
        window.location.hash = '';
    }
}, []);

useEffect(() => {
  // Access Token aus localStorage abrufen
  const accessToken = localStorage.getItem('spotifyAccessToken');

  // Benutzerinformationen nur abrufen, wenn ein Access Token vorhanden ist
  if (accessToken) {
      axios.get('https://api.spotify.com/v1/me', {
          headers: {
              Authorization: `Bearer ${accessToken}`
          }
      })
      .then(response => {
          setUserData(response.data); // Speichern der Benutzerdaten im State
          console.log("Benutzerdaten abgerufen:", response.data);
      })
      .catch(error => {
          console.error("Fehler beim Abrufen der Benutzerdaten:", error);
      });
  }
}, []);

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
            <Route path="/musicTriviaPlay" element={<MusicTrivia />} />
            <Route path="/association" element={<Association />} />
            <Route path="/room/:roomId" element={<RoomPage />} />
            <Route path="/musicTrivia" element={<Auth />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="/musicTriviaGame" element={<MusicTriviaGame />} />
          </Routes>
        </div>
       
   
  );
}

export default App;
