import React from 'react'
import axios from "axios";
import { useState, useEffect } from "react";

function PlaylistSearch({ onPlaylistsSelected }) {
    const [playlists, setPlaylists] = useState([]);  // Alle Playlists des Benutzers
    const [selectedPlaylists, setSelectedPlaylists] = useState([]);  // Ausgewählte Playlists

    // Wenn ausgewählte Playlists sich ändern, rufe onPlaylistsSelected auf
    useEffect(() => {
        onPlaylistsSelected(selectedPlaylists);
    }, [selectedPlaylists]);

    // Hole alle Playlists des Benutzers
    const fetchUserPlaylists = async () => {
        const accessToken = localStorage.getItem('spotifyAccessToken'); // Holen des Tokens aus localStorage
        if (!accessToken) {
            console.error('Kein Access Token gefunden!');
            return; // Wenn kein Access Token vorhanden, stoppen
        }

        try {
            // API-Aufruf, um die Playlists des Benutzers abzurufen
            const response = await axios.get("https://api.spotify.com/v1/me/playlists", {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            // Setze die Playlists in den State
            setPlaylists(response.data.items);
        } catch (error) {
            console.error('Fehler beim Abrufen der Playlists:', error);
        }
    };

    // Füge eine Playlist zu den ausgewählten Playlists hinzu
    const addPlaylist = (playlist) => {
        setSelectedPlaylists([...selectedPlaylists, playlist]);
    };

    // Rufe die Playlists des Benutzers beim ersten Laden des Komponenten ab
    useEffect(() => {
        fetchUserPlaylists();
    }, []);

    return (
        <div>
            <h3>Meine Playlists</h3>

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