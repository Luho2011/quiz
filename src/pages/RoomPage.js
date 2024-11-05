import React from 'react'
import {useState, useEffect} from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { db } from "../firebase";
import { collection, doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import PlaylistSearch from '../PlaylistSearch';

function RoomPage() {
  const { roomId } = useParams();
  const [username, setUsername] = useState("");
  const [players, setPlayers] = useState([]);
  const [isJoining, setIsJoining] = useState(true);
  const [selectedPlaylists, setSelectedPlaylists] = useState([]);
  const navigate = useNavigate();

    // Raumdaten abrufen und auf Spieler-Updates hören
    useEffect(() => {
        const roomRef = doc(db, "rooms", roomId);
        const unsubscribe = onSnapshot(roomRef, (snapshot) => {
          const roomData = snapshot.data();
          setPlayers(roomData.players || []);
        });
    
        return () => unsubscribe(); // Aufräumen
      }, [roomId]);
    
      // Spieler beitreten und zur Datenbank hinzufügen
      const joinRoom = async () => {
        if (username.trim() === "") {
          alert("Bitte gib einen Benutzernamen ein!");
          return;
        }
    
        const roomRef = doc(db, "rooms", roomId);
        const roomSnapshot = await getDoc(roomRef);
        if (roomSnapshot.exists()) {
          const roomData = roomSnapshot.data();
          const updatedPlayers = [...roomData.players, username];
    
          await updateDoc(roomRef, { players: updatedPlayers });
          setIsJoining(false); // Spieler ist dem Raum beigetreten
        }
      };

      // Funktion zum Spielstart und Navigation zur Spielseite
    const startGame = () => {
     if (selectedPlaylists.length > 0) {
        navigate('/musicTriviaGame', { state: { selectedPlaylists } });
     } else {
        alert("Bitte wähle mindestens eine Playlist aus, um das Spiel zu starten.");
      }
    };
  
    return (
      <div style={{ display: "flex", padding: "20px" }}>
        {/* Teilnehmerliste */}
        <div style={{ width: "20%", paddingRight: "20px", borderRight: "1px solid #ccc" }}>
          <h3>Teilnehmer</h3>
          <ul>
            {players.map((player, index) => (
              <li key={index}>{player}</li>
            ))}
          </ul>
        </div>
  
        {/* Raum-Einstellungen und Spieloptionen */}
        <div style={{ width: "80%", paddingLeft: "20px" }}>
          {isJoining ? (
            <div>
              <input
                type="text"
                placeholder="Benutzernamen eingeben"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ padding: "10px", fontSize: "16px" }}
              />
              <button onClick={joinRoom} style={{ marginLeft: "10px", padding: "10px", fontSize: "16px" }}>
                Beitreten
              </button>
            </div>
          ) : (
            <div>
              <h2>Raum ID: {roomId}</h2>
  
              {/* Playlist-Auswahl */}
              <div className="playlist">
                <PlaylistSearch onPlaylistsSelected={setSelectedPlaylists} />
              </div>
  
              {/* Spielstart-Button */}
              <button
                onClick={startGame}
                style={{ marginTop: "20px", padding: "10px", fontSize: "16px" }}
              >
                Spiel starten
              </button>
            </div>
          )}
        </div>
      </div>
    );
    }

export default RoomPage