import React from 'react'
import {useState, useEffect, useRef } from "react";
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

function MusicTriviaGame() {
    const location = useLocation();
    const navigate = useNavigate();
    const [songs, setSongs] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const [showSolution, setShowSolution] = useState(false);
    const playerRef = useRef(null);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const selectedPlaylists = location.state?.selectedPlaylists || [];
    const [isPremium, setIsPremium] = useState(false);

    useEffect(() => {
        const accessToken = localStorage.getItem('spotifyAccessToken');

        // Prüfen, ob ein Access Token vorhanden ist
        if (accessToken) {
            // Anfrage an den /me-Endpunkt
            axios.get('https://api.spotify.com/v1/me', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
            .then(response => {
                const userProduct = response.data.product;
                
                // Überprüfen, ob das Konto Premium ist
                if (userProduct === "premium") {
                    setIsPremium(true);
                    console.log("Benutzer hat ein Premium-Konto.");
                } else {
                    setIsPremium(false);
                    console.log("Benutzer hat kein Premium-Konto.");
                }
            })
            .catch(error => {
                console.error("Fehler beim Überprüfen des Spotify-Kontos:", error);
            });
        } else {
            console.log("Kein Access Token verfügbar.");
        }
    }, []);

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
        const initSpotifyPlayer = () => {
            if (window.Spotify) {
                playerRef.current = new window.Spotify.Player({
                    name: 'Web Playback SDK',
                    getOAuthToken: cb => { cb(localStorage.getItem('spotifyAccessToken')); },
                    volume: 0.5
                });

                playerRef.current.addListener('ready', ({ device_id }) => {
                    console.log('Ready with Device ID', device_id);
                    setIsPlayerReady(true);
                });

                playerRef.current.addListener('initialization_error', ({ message }) => { console.error('Initialization Error:', message); });
                playerRef.current.addListener('authentication_error', ({ message }) => { console.error('Authentication Error:', message); });
                playerRef.current.addListener('account_error', ({ message }) => { console.error('Account Error:', message); });
                playerRef.current.addListener('playback_error', ({ message }) => { console.error('Playback Error:', message); });

                playerRef.current.connect().then(success => {
                    if (success) {
                        console.log('The Web Playback SDK is ready to play!');
                    } else {
                        console.error('Failed to connect the Web Playback SDK');
                    }
                });
            } else {
                console.error('Spotify SDK not loaded');
            }
        };

        // Überprüfen, ob das SDK geladen ist
        const checkSpotifySDKLoaded = () => {
            if (window.Spotify) {
                initSpotifyPlayer();
            } else {
                setTimeout(checkSpotifySDKLoaded, 100);
            }
        };

        checkSpotifySDKLoaded();

    }, [selectedPlaylists]);

    const selectRandomSong = (availableSongs) => {
        if (availableSongs.length > 0) {
            const randomSong = availableSongs[Math.floor(Math.random() * availableSongs.length)];
            setCurrentSong(randomSong);
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
            playerRef.current.play(playSong).then(() => {
                console.log('Playback started');
            }).catch(error => {
                console.error('Error while trying to play the song:', error);
            });
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Music Trivia Game</h1>

            {currentSong ? (
                <div style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "8px", maxWidth: "400px", margin: "20px auto" }}>
                    <h2>Errate den Song</h2>
                    {isPlayerReady ? (
                        <button onClick={handlePlaySong}>Play</button>
                    ) : (
                        <p>Warte auf den Spotify Player...</p>
                    )}

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