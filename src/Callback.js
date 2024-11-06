import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get('code');

    if (code) {
      fetchAccessToken(code);
    } else {
      // Wenn kein Code vorhanden ist, leite zurück zur Hauptseite
      navigate('/');
    }
  }, [navigate]);

  async function fetchAccessToken(code) {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'https://celeb-quiz.vercel.app/callback',
        client_id: 'cda1724d1cc24c6c83e339e9eeeb356e',
        client_secret: '62a54a8e3f72467ab982d0ba0728ba79',
      }),
    });

    const data = await response.json();
    console.log('Response from Spotify:', data); // <-- Hier hinzufügen
    const accessToken = data.access_token;

    if (accessToken) {
      localStorage.setItem('spotifyAccessToken', accessToken);
      // Hier zur musicTriviaPlay-Seite navigieren
      navigate('/musicTriviaPlay');
    } else {
      console.error('Fehler beim Abrufen des Access Tokens:', data);
      navigate('/'); // Zurück zur Hauptseite, wenn der Token nicht abgerufen werden konnte
    }
  }

  return <div>Lade...</div>;
};

export default Callback;