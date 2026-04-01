import React, { useEffect, useState } from 'react';
import axios from 'axios';

function PlaylistSearch({ onPlaylistsSelected }) {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    onPlaylistsSelected(selectedPlaylists);
  }, [selectedPlaylists]);

  useEffect(() => {
    const accessToken = localStorage.getItem('spotifyAccessToken');
    if (!accessToken) {
      console.error("Kein Access Token gefunden!");
      return;
    }
    fetchUserPlaylists(accessToken);
  }, []);

  const fetchUserPlaylists = async (accessToken) => {
    setIsLoading(true);
    try {
      let allPlaylists = [];
      let nextUrl = "https://api.spotify.com/v1/me/playlists";

      while (nextUrl) {
        const response = await axios.get(nextUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        allPlaylists = [...allPlaylists, ...response.data.items];
        nextUrl = response.data.next;
      }

      setPlaylists(allPlaylists);
    } catch (error) {
      console.error('Fehler beim Abrufen der Playlists:', error);
        if (error.response && error.response.status === 401) {
        console.log("Token abgelaufen → neu einloggen");

        localStorage.removeItem('spotifyAccessToken');
        window.location.href = "/spotifyAuth"; // zurück zum Login
       }
    } finally {
      setIsLoading(false);
    }
  };

  const addPlaylist = (playlist) => {
    if (!selectedPlaylists.find(p => p.id === playlist.id)) {
      setSelectedPlaylists([...selectedPlaylists, playlist]);
    }
  };

  return (
    <div>
      <h3>Meine Playlists</h3>
      {isLoading && <p>Lade Playlists...</p>}

      <h4>Alle Playlists:</h4>
      <ul>
        {playlists.map((playlist) => (
          <li key={playlist.id}>
            {playlist.name}{" "}
            <button onClick={() => addPlaylist(playlist)}>Hinzufügen</button>
          </li>
        ))}
      </ul>

      <h4>Ausgewählte Playlists:</h4>
      <ul>
        {selectedPlaylists.map((playlist) => (
          <li key={playlist.id}>{playlist.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default PlaylistSearch;
