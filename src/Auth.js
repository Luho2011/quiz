import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CLIENT_ID = 'cda1724d1cc24c6c83e339e9eeeb356e';
const REDIRECT_URI = 'https://celeb-quiz.vercel.app/callback'; // oder die URI, die du in Spotify registriert hast
const SCOPES = 'playlist-read-private playlist-read-collaborative user-read-private user-read-email'; // Füge playlist-read-private hinzu

const AUTH_URL = `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;

function Auth() {
  const [accessToken, setAccessToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Überprüfe, ob ein Authorization Code in der URL ist
    const code = new URLSearchParams(window.location.search).get('code');

    if (code) {
      // Wenn der Code vorhanden ist, rufe den Access Token ab
      fetchAccessToken(code);
    } else {
      // Wenn kein Code vorhanden ist, leite den Benutzer zur Authentifizierung weiter
      window.location.href = AUTH_URL;
    }
  }, []);

  async function fetchAccessToken(code) {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: '62a54a8e3f72467ab982d0ba0728ba79', // Dein Client Secret
      }),
    });

    const data = await response.json();
    const token = data.access_token;

    if (token) {
      setAccessToken(token);
      console.log('Access Token:', token);
      // Hier kannst du den Token speichern, um ihn für API-Anfragen zu verwenden
      // Beispielsweise in localStorage oder in deinem State-Management (Redux, Context, etc.)
    } else {
      console.error('Fehler beim Abrufen des Access Tokens:', data);
    }
  }

  return (
    <div>
      <h1>Willkommen zur Spotify App</h1>
      {accessToken ? (
        <p>Token erhalten! Du kannst jetzt die API verwenden.</p>
      ) : (
        <p>Bitte warte, während du zur Spotify-Anmeldung weitergeleitet wirst...</p>
      )}
    </div>
  );
}

export default Auth;