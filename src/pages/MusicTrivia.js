import React from 'react'
import "./MusicTrivia.css";
import {useState} from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

function MusicTrivia() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const createRoom = async () => {
    if (username.trim() === "") {
      alert("Bitte gib einen Benutzernamen ein!");
      return;
    }

    try {
      // Raum in der Datenbank erstellen
      const roomRef = await addDoc(collection(db, "rooms"), {
        host: username,
        players: [username],
        createdAt: new Date(),
      });

      // Zum neuen Raum navigieren
      navigate(`/room/${roomRef.id}`);
    } catch (error) {
      console.error("Fehler beim Erstellen des Raums:", error);
      alert("Fehler beim Erstellen des Raums. Versuche es erneut.");
    }
  };

  

  return (
    <div>
      <h1>Musictrivia</h1>
      <input
        type="text"
        placeholder="Benutzernamen eingeben"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={createRoom}>
        Raum erstellen
      </button>
    </div>
  )
}

export default MusicTrivia