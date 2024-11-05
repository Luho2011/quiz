import React from 'react'
import {useState, useEffect, useRef } from "react";
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

function MusicTriviaGame() {
    const location = useLocation();
    const navigate = useNavigate();
    const [songs, setSongs] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showSolution, setShowSolution] = useState(false);
    const selectedPlaylists = location.state?.selectedPlaylists || [];
    const playerRef = useRef(null); // Referenz für den Player

    // Lade Songs aus den ausgewählten Playlists
    useEffect(() => {
        const loadSongs = async () => {
            let songData = [];
            for (let playlist of selectedPlaylists) {
                const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('spotifyAccessToken')}`,
                    }
                });
                songData = [...songData, ...response.data.items.map(item => item.track)];
            }
            setSongs(songData);
            selectRandomSong(songData);
        };

        loadSongs();

        // Player initialisieren
        if (window.Spotify) {
            playerRef.current = new window.Spotify.Player({
                name: 'Web Playback SDK',
                getOAuthToken: cb => { cb(localStorage.getItem('spotifyAccessToken')); },
                volume: 0.5
            });

            // Error Handling
            playerRef.current.addListener('initialization_error', ({ message }) => { console.error(message); });
            playerRef.current.addListener('authentication_error', ({ message }) => { console.error(message); });
            playerRef.current.addListener('account_error', ({ message }) => { console.error(message); });
            playerRef.current.addListener('playback_error', ({ message }) => { console.error(message); });

            // Player ready
            playerRef.current.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
            });

            // Connect to the player
            playerRef.current.connect();
        } else {
            console.error('Spotify SDK not loaded');
        }
    }, [selectedPlaylists]);

    const selectRandomSong = (availableSongs) => {
        if (availableSongs.length > 0) {
            const randomSong = availableSongs[Math.floor(Math.random() * availableSongs.length)];
            setCurrentSong(randomSong);
            setIsPlaying(false);
            setShowSolution(false);
        } else {
            setCurrentSong(null);
        }
    };

    const revealSolution = () => setShowSolution(true);

    const handleNextSong = () => {
        const remainingSongs = songs.filter(song => song.id !== currentSong.id);
        setSongs(remainingSongs);
        selectRandomSong(remainingSongs);
    };

    const handlePlaySong = () => {
        if (currentSong && playerRef.current) {
            const playSong = {
                uris: [currentSong.uri]
            };
            playerRef.current.resume().then(() => {
                playerRef.current.play(playSong);
            });
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Music Trivia Game</h1>

            {currentSong ? (
                <div style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "8px", maxWidth: "400px", margin: "20px auto" }}>
                    <h2>Errate den Song</h2>
                    <button onClick={handlePlaySong}>Play</button>

                    {showSolution ? (
                        <div>
                            <p><strong>Song:</strong> {currentSong.name}</p>
                            <p><strong>Interpret:</strong> {currentSong.artists[0].name}</p>
                            <p><strong>Release Datum:</strong> {currentSong.album.release_date}</p>
                        </div>
                    ) : (
                        <div>
                            <button onClick={revealSolution}>Lösung anzeigen</button>
                        </div>
                    )}

                    <div style={{ marginTop: "20px" }}>
                        <button onClick={handleNextSong}>Nächster Song</button>
                    </div>
                </div>
            ) : (
                <p>Keine weiteren Songs verfügbar</p>
            )}
        </div>
    );
}

export default MusicTriviaGame;