import React from 'react'
import axios from "axios";
import {useState, useEffect} from "react";

function PlaylistSearch({ onPlaylistsSelected }) {
    const [query, setQuery] = useState("");
    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylists, setSelectedPlaylists] = useState([]);

    useEffect(() => {
        onPlaylistsSelected(selectedPlaylists);
    }, [selectedPlaylists]);

    const searchPlaylists = async () => {
        const accessToken = localStorage.getItem('spotifyAccessToken'); // Hier den Token aus localStorage abrufen
        if (!accessToken) {
            console.error('Kein Access Token gefunden!');
            return; // Beende die Funktion, wenn kein Token vorhanden ist
        }

        try {
            const response = await axios.get("https://api.spotify.com/v1/search", {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { q: query, type: "playlist", limit: 5 },
            });
            setPlaylists(response.data.playlists.items);
        } catch (error) {
            console.error('Fehler bei der Playlist-Suche:', error);
        }
    };

    const addPlaylist = (playlist) => {
        setSelectedPlaylists([...selectedPlaylists, playlist]);
    };

    return (
        <div>
            <h3>Playlist hinzufügen</h3>
            <input
                type="text"
                placeholder="Playlist suchen"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ padding: "10px", fontSize: "16px" }}
            />
            <button onClick={searchPlaylists} style={{ marginLeft: "10px", padding: "10px", fontSize: "16px" }}>
                Suchen
            </button>

            <div>
                <h4>Suchergebnis:</h4>
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
        </div>
    );
}

export default PlaylistSearch;