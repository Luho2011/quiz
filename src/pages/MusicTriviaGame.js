import React from 'react'
import {useState, useEffect, useRef } from "react";
import { useLocation } from 'react-router-dom';
import SpotifyPlayer from 'react-spotify-web-playback';

function MusicTriviaGame() {
  const location = useLocation();
  const { selectedPlaylists } = location.state || {}; // Übernommene Playlists vom vorherigen Zustand
  const [currentSong, setCurrentSong] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Beispiel-Songs, falls die Playlist leer ist
  const exampleSongs = [
    { id: 'song1', uri: 'spotify:track:4uLU6hMCjMI75M1A2tKUQC', name: 'Bohemian Rhapsody', artist: 'Queen', releaseDate: '1975' },
    { id: 'song2', uri: 'spotify:track:7GhIk7Il098yCjg4BQjzvb', name: 'Stayin\' Alive', artist: 'Bee Gees', releaseDate: '1977' },
  ];

  // Song zufällig aus den Playlists auswählen
  const getRandomSong = () => {
    if (selectedPlaylists && selectedPlaylists.length > 0) {
      const allSongs = selectedPlaylists.flatMap(playlist => playlist.tracks); // Über alle Tracks in den Playlists iterieren
      return allSongs[Math.floor(Math.random() * allSongs.length)];
    }
    return exampleSongs[Math.floor(Math.random() * exampleSongs.length)]; // Beispielsong falls keine Playlists vorhanden sind
  };

  // Laden eines neuen zufälligen Songs
  const loadNewSong = () => {
    const song = getRandomSong();
    setCurrentSong(song);
    setShowSolution(false);
    setIsPlaying(false);
  };

  // Erstes Laden eines Songs bei Komponenteneinbindung
  useEffect(() => {
    loadNewSong();
  }, []);

  // Lösung anzeigen
  const revealSolution = () => setShowSolution(true);

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
      <div
        style={{
          width: "300px",
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          textAlign: "center",
        }}
      >
        <h3>Interpret: {showSolution ? currentSong.artist : "?"}</h3>
        <h4>Song: {showSolution ? currentSong.name : "?"}</h4>
        <p>Release Date: {showSolution ? currentSong.releaseDate : "?"}</p>

        {/* Spotify Web Player */}
        {currentSong && (
          <div style={{ marginTop: "10px" }}>
            <SpotifyPlayer
              token="YOUR_SPOTIFY_ACCESS_TOKEN" // Spotify Token hier einfügen
              uris={[currentSong.uri]}
              autoPlay={false}
              play={isPlaying}
              callback={(state) => setIsPlaying(state.isPlaying)}
              styles={{
                activeColor: '#1DB954',
                bgColor: '#333',
                color: '#fff',
                loaderColor: '#1DB954',
                sliderColor: '#1DB954',
                trackArtistColor: '#ccc',
                trackNameColor: '#fff',
              }}
            />
          </div>
        )}

        {/* Lösung und Weiter Buttons */}
        <div style={{ display: "flex", justifyContent: "space-around", marginTop: "15px" }}>
          <button onClick={revealSolution} style={{ padding: "10px", fontSize: "14px" }}>
            Lösung
          </button>
          <button onClick={loadNewSong} style={{ padding: "10px", fontSize: "14px" }}>
            Weiter
          </button>
        </div>
      </div>
    </div>
  );
}

export default MusicTriviaGame;