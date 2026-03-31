import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlaylistSearch from '../PlaylistSearch';

function RoomPage() {
  const [selectedPlaylists, setSelectedPlaylists] = useState([]);
  const [accessToken, setAccessToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('spotifyAccessToken');
    if (!token) {
      alert("Bitte melde dich zuerst bei Spotify an!");
      navigate('/musicTrivia'); // zurück zur Auth-Seite
    } else {
      setAccessToken(token);
    }
  }, [navigate]);

  const startGame = () => {
    if (selectedPlaylists.length > 0) {
      navigate('/hitster', { state: { selectedPlaylists } });
    } else {
      alert("Bitte wähle mindestens eine Playlist aus, um das Spiel zu starten.");
    }
  };

  if (!accessToken) return <div>Lade Spotify Token...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Wähle deine Playlists</h2>
      <PlaylistSearch onPlaylistsSelected={setSelectedPlaylists} />
      <button
        onClick={startGame}
        style={{ marginTop: "20px", padding: "10px", fontSize: "16px" }}
      >
        Spiel starten
      </button>
    </div>
  );
}

export default RoomPage;