import React, { useState, useEffect } from 'react';
import './MusicTriviaGame.css';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import { useLocation } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
// Test deploy
function MusicTriviaGame() {
    const location = useLocation();
    const [songs, setSongs] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const [showSolution, setShowSolution] = useState(false);
    const selectedPlaylists = location.state?.selectedPlaylists || [];
    const [topContainer, setTopContainer] = useState([]);
    const [bottomContainer, setBottomContainer] = useState([]);
    const [songDropped, setSongDropped] = useState(false);
    const [editingSongId, setEditingSongId] = useState(null);
    

    useEffect(() => {
        const loadSongs = async () => {
            let playlistSongs = []; // Array, das Songs aus jeder Playlist speichert
            
            // Lade Songs aus allen Playlists
            for (let playlist of selectedPlaylists) {
                const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('spotifyAccessToken')}`,
                    }
                });
                const songs = response.data.items.map(item => item.track);
                playlistSongs.push({ playlistId: playlist.id, songs: songs });
            }
            
            // Setze die geladenen Playlist-Songs im State
            setSongs(playlistSongs);
            selectRandomSong(playlistSongs);
        };
        loadSongs();
    }, [selectedPlaylists]);

    const selectRandomSong = (playlistSongs) => {
        if (playlistSongs && playlistSongs.length > 0) {
            // Wähle zufällig eine Playlist
            const randomPlaylist = playlistSongs[Math.floor(Math.random() * playlistSongs.length)];
            
            // Wähle zufällig einen Song aus der gewählten Playlist
            const randomSong = randomPlaylist.songs[Math.floor(Math.random() * randomPlaylist.songs.length)];
            
            setCurrentSong(randomSong);
            setShowSolution(false);
            setSongDropped(false);
        } else {
            setCurrentSong(null);
        }
    };

    const handleNextSong = () => {
        if (!currentSong) return;
    
        // Finde die Playlist, aus der der aktuelle Song stammt
        const playlistIndex = songs.findIndex(playlist => 
            playlist.songs.some(song => song.id === currentSong.id)
        );
    
        // Entferne den Song aus der gewählten Playlist
        const updatedPlaylists = [...songs];
        const updatedPlaylist = updatedPlaylists[playlistIndex];
        updatedPlaylist.songs = updatedPlaylist.songs.filter(song => song.id !== currentSong.id);
    
        // Wenn noch Songs in dieser Playlist sind, wähle einen neuen zufälligen Song aus dieser Playlist
        if (updatedPlaylist.songs.length > 0) {
            updatedPlaylists[playlistIndex] = updatedPlaylist;
            setSongs(updatedPlaylists);
            selectRandomSong(updatedPlaylists);
        } else {
            // Wenn keine Songs mehr übrig sind, entferne die Playlist
            updatedPlaylists.splice(playlistIndex, 1);
            setSongs(updatedPlaylists);
    
            // Wähle zufällig einen Song aus den verbleibenden Playlists
            if (updatedPlaylists.length > 0) {
                selectRandomSong(updatedPlaylists);
            } else {
                setCurrentSong(null); // Keine Songs mehr verfügbar
            }
        }
    };

    const onDragEnd = (result) => {
        const { source, destination } = result;

        if (!destination) return;

        if (source.droppableId === destination.droppableId) {
            // Wenn es im selben Container bleibt
            const container =
                source.droppableId === "topContainer" ? [...topContainer] :
                source.droppableId === "bottomContainer" ? [...bottomContainer] :
                [];

            const [movedSong] = container.splice(source.index, 1);
            container.splice(destination.index, 0, movedSong);

            if (source.droppableId === "topContainer") {
                setTopContainer(container);
            } else if (source.droppableId === "bottomContainer") {
                setBottomContainer(container);
            }
        } else {
            // Verschieben zwischen Containern
            const sourceContainer =
                source.droppableId === "topContainer" ? [...topContainer] :
                source.droppableId === "bottomContainer" ? [...bottomContainer] :
                [currentSong]; // Wenn es aus dem centerContainer kommt, nehme die aktuelle Karte

            const destinationContainer =
                destination.droppableId === "topContainer" ? [...topContainer] :
                destination.droppableId === "bottomContainer" ? [...bottomContainer] :
                [];

            const [movedSong] = sourceContainer.splice(source.index, 1);

            if (!movedSong) {
                console.error("No song found to move");
                return;
            }

            destinationContainer.splice(destination.index, 0, movedSong);

            // Setze den Zielcontainer
            if (destination.droppableId === "topContainer") {
                setTopContainer(destinationContainer);
                if (source.droppableId === "bottomContainer") {
                    setBottomContainer(sourceContainer);
                }
            } else if (destination.droppableId === "bottomContainer") {
                setBottomContainer(destinationContainer);
                if (source.droppableId === "topContainer") {
                    setTopContainer(sourceContainer);
                }
            } else {
                // Im CenterContainer bleibt der aktuelle Song
                setCurrentSong(movedSong);
            }
        }

        setSongDropped(true); // Ermögliche das Klicken auf den "Next"-Button
    };

    const revealSolution = (song, container, setContainer) => {
        const updatedContainer = container.map(item =>
            item.id === song.id ? { ...item, showDetails: true } : item
        );
        setContainer(updatedContainer);
    };

    const handleRemoveSong = (song, container, setContainer) => {
        const updatedContainer = container.filter(item => item.id !== song.id);
        setContainer(updatedContainer);
    };

    const saveYear = (song, newYear, container, setContainer) => {
    const updatedContainer = container.map(item =>
        item.id === song.id
            ? { ...item, customYear: newYear }
            : item
    );

    setContainer(updatedContainer);
    setEditingSongId(null);
};

    return (
        <div className='musicTriviaGame'>
            <DragDropContext onDragEnd={onDragEnd}>
                {/* Oben Container für abgelegte Karten */}
                <Droppable droppableId="topContainer" direction="horizontal">
                    {(provided) => (
                        <div className='topContainer dropZone' ref={provided.innerRef} {...provided.droppableProps}>
                            {topContainer.map((song, index) => (
                                <Draggable key={song.id} draggableId={song.id} index={index}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="songCard"
                                        >
                                            <button 
                                                className="removeSong" 
                                                onClick={() => handleRemoveSong(song, topContainer, setTopContainer)}
                                            >
                                                &#10005;
                                            </button>
                                            {song.showDetails ? (
                                                <>
                                                <div className='musicInterpret'>
                                                     <p>{song.artists[0].name}</p>
                                                </div>  
                                                    {editingSongId === song.id ? (
    <input
        type="number"
        className="editYearInput"
        defaultValue={song.customYear ?? song.album.release_date.slice(0, 4)}
        autoFocus
        onBlur={(e) =>
            saveYear(song, e.target.value, topContainer, setTopContainer)
        }
        onKeyDown={(e) => {
            if (e.key === 'Enter') {
                saveYear(song, e.target.value, topContainer, setTopContainer);
            }
        }}
    />
) : (
    <p
        className="musicDate"
        onDoubleClick={() => setEditingSongId(song.id)}
    >
        {song.customYear ?? song.album.release_date.slice(0, 4)}
    </p>
)}

                                                    <p className='musicSong'>{song.name}</p>
                                                </>
                                            ) : (
                                                <button 
                                                    className='songSolution' 
                                                    onClick={() => revealSolution(song, topContainer, setTopContainer)}
                                                >
                                                    Solution
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>

                {/* Hauptcontainer für aktuelle Karte */}
                <Droppable droppableId="centerContainer">
                    {(provided) => (
                        <div className='centerContainer dropZone' ref={provided.innerRef} {...provided.droppableProps}>
                            <div className='qrNext'>
                                {/* QR-Code-Container */}
                                <div className='qrCodeContainer'>
                                    <div className='qrCodeContainer2'>
                                        <div className='qrCodeContainer3'>
                                            <div className='qrCodeContainer4'>
                                                {currentSong && (
                                                    <QRCodeCanvas 
                                                    value={`https://open.spotify.com/track/${currentSong.id}`}
                                                    size={180}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                               </div>
                                    <div>
                                            <button className='nextSong' onClick={handleNextSong} disabled={!songDropped}>
                                                Next Song
                                            </button>
                                    </div>
                            </div>
                               
                            {currentSong ? (
                                <Draggable draggableId={currentSong.id} index={0} key={currentSong.id}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className='songCard'
                                        >
                                            <div className="songContent">
                                                {showSolution ? (
                                                    <>
                                                        <p className='musicInterpret'>{currentSong.artists[0].name}</p>
                                                        <p className='musicDate'>{currentSong.album.release_date.slice(0, 4)}</p>
                                                        <p className='musicSong'>{currentSong.name}</p>
                                                    </>
                                                ) : (
                                                    <button className='songSolution' onClick={() => setShowSolution(true)}>Solution</button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </Draggable>
                            ) : (
                                <p>No more songs available</p>
                            )}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>

                {/* Unten Container für abgelegte Karten */}
                <Droppable droppableId="bottomContainer" direction="horizontal">
                    {(provided) => (
                        <div className='bottomContainer dropZone' ref={provided.innerRef} {...provided.droppableProps}>
                            {bottomContainer.map((song, index) => (
                                <Draggable key={song.id} draggableId={song.id} index={index}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="songCard"
                                        >
                                            <button 
                                                className="removeSong" 
                                                onClick={() => handleRemoveSong(song, bottomContainer, setBottomContainer)}
                                            >
                                                &#10005;
                                            </button>
                                            {song.showDetails ? (
                                                <>
                                                <div className='musicInterpret'>
                                                     <p>{song.artists[0].name}</p>
                                                </div>                                                  

{editingSongId === song.id ? (
    <input
        type="number"
        className="editYearInput"
        defaultValue={song.customYear ?? song.album.release_date.slice(0, 4)}
        autoFocus
        onBlur={(e) =>
            saveYear(song, e.target.value, bottomContainer, setBottomContainer)
        }
        onKeyDown={(e) => {
            if (e.key === 'Enter') {
                saveYear(song, e.target.value, bottomContainer, setBottomContainer);
            }
        }}
    />
) : (
    <p
        className="musicDate"
        onDoubleClick={() => setEditingSongId(song.id)}
    >
        {song.customYear ?? song.album.release_date.slice(0, 4)}
    </p>
)}

                                                  
                                                <div className='musicSong'>
                                                  <p>{song.name}</p>
                                                </div>    
                                                </>
                                            ) : (
                                                <button 
                                                    className='songSolution' 
                                                    onClick={() => revealSolution(song, bottomContainer, setBottomContainer)}
                                                >
                                                    Solution
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

        </div>
    );
}

export default MusicTriviaGame;