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
        client_id: 'dc7167f21f264a89aafe40360bc1e358',
        client_secret: '76e872298f364d4b9de3d5e0691da5bd',
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