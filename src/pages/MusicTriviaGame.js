import React from 'react'
import {useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

function MusicTriviaGame() {
    const location = useLocation();
    const [songs, setSongs] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showSolution, setShowSolution] = useState(false);
    const selectedPlaylists = location.state?.selectedPlaylists || [];

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
    }, [selectedPlaylists]);

    // Funktion zum Abspielen des nächsten zufälligen Songs
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

    // Initialisiere den Spotify Player
    useEffect(() => {
        window.onSpotifyWebPlaybackSDKReady = () => {
            const token = localStorage.getItem('spotifyAccessToken');

            const player = new window.Spotify.Player({
                name: 'Web Playback SDK',
                getOAuthToken: cb => { cb(token); },
                volume: 0.5
            });

            // Player-Events hinzufügen
            player.addListener('ready', ({ device_id }) => {
                console.log('Got Device ID', device_id);
            });

            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });

            player.connect();
        };
    }, []); // Leere Abhängigkeit, um nur einmal zu laufen

    const handlePlaySong = () => {
        if (currentSong) {
            const token = localStorage.getItem('spotifyAccessToken');
            const player = new window.Spotify.Player({
                name: 'Web Playback SDK',
                getOAuthToken: cb => { cb(token); }
            });

            player.play({
                uris: [`spotify:track:${currentSong.id}`]
            }).then(() => {
                console.log('Playing:', currentSong.name);
            }).catch(error => {
                console.error('Error playing the song:', error);
            });
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Music Trivia Game</h1>

            {currentSong ? (
                <div style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "8px", maxWidth: "400px", margin: "20px auto" }}>
                    <h2>Errate den Song</h2>
                    
                    {/* Button zum Abspielen des Songs */}
                    <button onClick={handlePlaySong}>Song Abspielen</button>
                    
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