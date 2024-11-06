import React from 'react'
import {useState, useEffect} from "react";
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import { useLocation, useNavigate } from 'react-router-dom';

function MusicTriviaGame() {
    const location = useLocation();
    const navigate = useNavigate();
    const [songs, setSongs] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
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

    return (
        <div style={{ padding: '20px' }}>
            <h1>Music Trivia Game</h1>

            {currentSong ? (
                <div style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "8px", maxWidth: "400px", margin: "20px auto" }}>
                    <h2>Errate den Song</h2>

                    {/* QR-Code für den aktuellen Song */}
                    <QRCodeCanvas 
                        value={`https://open.spotify.com/track/${currentSong.id}`}
                        size={256} // Größe des QR-Codes
                    />
                    <p>Scanne den QR-Code, um den Song in Spotify abzuspielen!</p>

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