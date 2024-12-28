import React from 'react';
import axios from 'axios';
import { useState, useEffect } from 'react';

function PlaylistSearch({ onPlaylistsSelected }) {
    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylists, setSelectedPlaylists] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        onPlaylistsSelected(selectedPlaylists);
    }, [selectedPlaylists]);

    const fetchUserPlaylists = async () => {
        const accessToken = localStorage.getItem('spotifyAccessToken'); // Holen des Tokens aus localStorage
        if (!accessToken) {
            console.error('Kein Access Token gefunden!');
            return;
        }

        setIsLoading(true); // Setze isLoading auf true, um einen Ladezustand anzuzeigen
        try {
            let allPlaylists = [];
            let nextUrl = "https://api.spotify.com/v1/me/playlists"; // Initiale URL

            // Solange es eine "next"-Seite gibt, lade die nächsten Playlists
            while (nextUrl) {
                const response = await axios.get(nextUrl, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                // Füge die aktuellen Playlists zur Gesamtliste hinzu
                allPlaylists = [...allPlaylists, ...response.data.items];

                // Setze die "next"-URL auf den nächsten Seiten-Link
                nextUrl = response.data.next;
            }

            // Alle Playlists in den State setzen
            setPlaylists(allPlaylists);
        } catch (error) {
            console.error('Fehler beim Abrufen der Playlists:', error);
        } finally {
            setIsLoading(false); // Setze isLoading auf false, wenn der Ladevorgang abgeschlossen ist
        }
    };

    const addPlaylist = (playlist) => {
        setSelectedPlaylists([...selectedPlaylists, playlist]);
    };

    useEffect(() => {
        fetchUserPlaylists(); // Lade Playlists beim ersten Rendern
    }, []);

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