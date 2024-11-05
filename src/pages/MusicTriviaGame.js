import React from 'react'
import {useState, useEffect} from "react";
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

function MusicTriviaGame() {
    const location = useLocation();
    const navigate = useNavigate();
    const [songs, setSongs] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const [guessPhase, setGuessPhase] = useState(true);
    const [cards, setCards] = useState([]);
    const [sortedCards, setSortedCards] = useState([]);
    const selectedPlaylists = location.state?.selectedPlaylists || [];

    // Lade Songs aus Playlists
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
            setCurrentSong(songData[Math.floor(Math.random() * songData.length)]);
        };
        loadSongs();
    }, [selectedPlaylists]);

    // Timer für das Abspielen
    useEffect(() => {
        if (currentSong) {
            const timer = setTimeout(() => setGuessPhase(false), 30000);
            return () => clearTimeout(timer);
        }
    }, [currentSong]);

    const revealSolution = () => setGuessPhase(false);

    const addCardToSorted = (position) => {
        const newCard = {
            ...currentSong,
            position
        };
        setSortedCards([...sortedCards, newCard]);
        setCards(cards.filter(card => card.id !== currentSong.id));
        // Neues zufälliges Lied auswählen
        const remainingSongs = songs.filter(song => song.id !== currentSong.id);
        setSongs(remainingSongs);
        setCurrentSong(remainingSongs[Math.floor(Math.random() * remainingSongs.length)]);
    };

    return (
        <div>
            <h1>Spielseite</h1>
            {currentSong ? (
                <div>
                    <h2>Errate den Song</h2>
                    <audio src={currentSong.preview_url} controls autoPlay={!guessPhase} />
                    {guessPhase ? (
                        <button onClick={revealSolution}>Lösung anzeigen</button>
                    ) : (
                        <div>
                            <p>{currentSong.name} - {currentSong.artists[0].name} ({currentSong.album.release_date})</p>
                            <button onClick={() => addCardToSorted('left')}>Vorheriges Jahr</button>
                            <button onClick={() => addCardToSorted('right')}>Späteres Jahr</button>
                        </div>
                    )}
                </div>
            ) : (
                <p>Keine weiteren Songs verfügbar</p>
            )}
            <h3>Sortierte Karten</h3>
            <div>
                {sortedCards.map((card, index) => (
                    <div key={index}>{card.name} - {card.artists[0].name}</div>
                ))}
            </div>
        </div>
    );
}

export default MusicTriviaGame;