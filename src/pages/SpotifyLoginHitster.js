import React from 'react';
import { useNavigate } from "react-router-dom";
import "./MusicTrivia.css";

function MusicTrivia() {
  const navigate = useNavigate();

  const startSpotifyFlow = () => {
    navigate("/musicTrivia"); // Leitet zur Spotify Auth-Seite
  };

  return (
    <div>
      <h1>MusicTrivia</h1>
      <button onClick={startSpotifyFlow}>
        Spiel starten
      </button>
    </div>
  );
}

export default MusicTrivia;