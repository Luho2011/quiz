import React from 'react'
import {useState, useEffect} from "react";
import { useLocation } from 'react-router-dom';

function MusicTriviaGame({ location }) {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [audio, setAudio] = useState(null);
  
  const { selectedPlaylists } = location.state || {}; // Die Playlists aus RoomPage

  useEffect(() => {
      if (currentSong && audio) {
          audio.src = currentSong.preview_url; // Preview-URL des Songs
          if (isPlaying) {
              audio.play();
          }
      }
  }, [currentSong, audio, isPlaying]);

  useEffect(() => {
      // Audio-Element für den Song-Player
      const newAudio = new Audio();
      setAudio(newAudio);

      return () => {
          if (audio) {
              audio.pause();
              audio.currentTime = 0;
          }
      };
  }, []);

  const startSong = () => {
      if (currentSong) {
          setIsPlaying(true);
      }
  };

  const pauseSong = () => {
      if (audio) {
          audio.pause();
          setIsPlaying(false);
      }
  };

  const showNextSong = () => {
      pauseSong();
      setShowSolution(false);

      // Wähle einen zufälligen Song aus den Playlists
      const randomPlaylist = selectedPlaylists[Math.floor(Math.random() * selectedPlaylists.length)];
      const randomSong = randomPlaylist.tracks.items[Math.floor(Math.random() * randomPlaylist.tracks.items.length)].track;
      
      setCurrentSong({
          name: randomSong.name,
          artist: randomSong.artists[0].name,
          release_date: randomSong.album.release_date,
          preview_url: randomSong.preview_url,
      });
  };

  return (
      <div style={{ padding: "20px" }}>
          <h2>Music Trivia Game</h2>
          
          <div style={{
              border: "1px solid #ccc",
              padding: "20px",
              borderRadius: "8px",
              maxWidth: "400px",
              textAlign: "center",
              margin: "20px auto"
          }}>
              <h3>Interpret: {showSolution ? currentSong?.artist : "?"}</h3>
              <h3>Song: {showSolution ? currentSong?.name : "?"}</h3>
              <h3>Releasedatum: {showSolution ? currentSong?.release_date : "?"}</h3>
              
              <div style={{ marginTop: "20px" }}>
                  <button onClick={startSong} disabled={isPlaying || !currentSong}>
                      {isPlaying ? "Wird abgespielt..." : "Play"}
                  </button>
                  <button onClick={pauseSong} disabled={!isPlaying}>
                      Pause
                  </button>
              </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px" }}>
              <button onClick={() => setShowSolution(true)}>
                  Lösung anzeigen
              </button>
              <button onClick={showNextSong}>
                  Nächstes Lied
              </button>
          </div>
      </div>
  );
}

export default MusicTriviaGame;