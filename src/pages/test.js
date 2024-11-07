import React from 'react';
import './MusicTriviaGame.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import { useLocation, useNavigate } from 'react-router-dom';
import {DragDropContext, Droppable, Draggable} from "react-beautiful-dnd";

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
        if (availableSongs && availableSongs.length > 0) {
            const randomSong = availableSongs[Math.floor(Math.random() * availableSongs.length)];
            setCurrentSong(randomSong);
            setShowSolution(false);
        } else {
            setCurrentSong(null);
        }
    };

    const revealSolution = () => setShowSolution(true);

    const handleNextSong = () => {
        // Abbrechen, wenn kein aktueller Song vorhanden ist
        if (!currentSong) return;

        // Restliche Songs filtern und prüfen, ob welche übrig sind
        const remainingSongs = songs.filter(song => song.id !== currentSong.id);
        setSongs(remainingSongs);
        
        if (remainingSongs.length > 0) {
            selectRandomSong(remainingSongs);
        } else {
            setCurrentSong(null); // Keine weiteren Songs
        }
    };

    return (
        <div className='musicTriviaGame'>
            <div className='musicContainer1'>  
            </div>
            {currentSong ? (
                <>
                    <div className='songCard'>
                        {showSolution ? (
                            // Lösung anzeigen
                            <>
                                <p className='musicInterpret'>{currentSong.artists[0].name}</p>
                                <p className='musicDate'>{currentSong.album.release_date.slice(0, 4)}</p>
                                <p className='musicSong'>{currentSong.name}</p>
                            </>
                        ) : (
                            // "Solution"-Button anzeigen
                            <button className='songSolution' onClick={revealSolution}>Solution</button>
                        )}
                    </div>

                    <div className='nextSong'>
                        {/* QR-Code für den aktuellen Song, nur anzeigen, wenn `currentSong` definiert ist */}
                        <div>
                            <QRCodeCanvas 
                                value={`https://open.spotify.com/track/${currentSong.id}`}
                                size={200} // Größe des QR-Codes
                            />
                        </div>
                        
                        {/* Button wird deaktiviert, wenn keine weiteren Songs verfügbar sind */}
                        <button className='nextSongButton' onClick={handleNextSong} disabled={!currentSong}>
                            Next
                        </button>
                    </div>
                </>
            ) : (
                <p>Keine weiteren Songs verfügbar</p>
            )}
            <div className='musicContainer2'>  
            </div>
        </div>
    );
}

export default MusicTriviaGame;

.musicTriviaGame {
    background-color: rgb(80, 80, 80);
    display: flex;
    align-items: center;
    flex-direction: column;
    position: relative;
    height: 100vh;
}

.musicContainer1 {
    height: 300px;
    width: 1900px;
    padding: 5px;
    border: solid;
    border-radius: 10px;
    background-color: rgb(128, 128, 128);
    display: flex;
    justify-content: center;
    position: relative;
}

.musicContainer2 {
    margin-top: 286px;
    height: 300px;
    width: 1900px;
    padding: 5px;
    border: solid;
    border-radius: 10px;
    background-color: rgb(128, 128, 128);
    display: flex;
    justify-content: center;
    position: relative;
}

.songSolution {
    cursor: pointer;
    height: 50px;
    width: 170px;
    border: none;
    border-radius: 20px;
    background-color: rgb(85, 85, 85);
    color: black;
    font-size: 1rem;
    font-weight: bold;
}

.songSolution:hover {
    background-color: rgb(110, 110, 110); 
    transition: all 0.1s;
}


.songCard {
    position: absolute;
    background-color: rgb(184, 184, 5);
    margin-top: 325px;
    width: 180px;
    height: 265px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    border: solid;
}


.musicInterpret {
    font-size: 20px;
}

.musicDate {
    font-weight: bolder;
    font-size: 60px;
    margin-top: 15px;
    margin-bottom: 15px;
}

.musicSong {
    font-style: italic;
    font-size: 20px;
}

.nextSong {
    position: absolute;
    margin-right: 625px;
    margin-top: 365px;
    display: flex;
    gap: 80px;
    align-items: center;
}

.nextSongButton {
    cursor: pointer;
    height: 35px;
    width: 75px;
    border: none;
    border-radius: 20px;
    background-color: rgb(128, 128, 128);
    color: black;
    font-size: 1rem;
    font-weight: bold;
}

.nextSongButton:hover {
    background-color: rgb(110, 110, 110); 
    transition: all 0.1s;
}
