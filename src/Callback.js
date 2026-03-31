import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CLIENT_ID = 'cda1724d1cc24c6c83e339e9eeeb356e';
const REDIRECT_URI = 'https://celeb-quiz.vercel.app/callback'; // Spotify Redirect URI
const CLIENT_SECRET = '62a54a8e3f72467ab982d0ba0728ba79';

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get('code');

    if (code) {
      fetchAccessToken(code);
    } else {
      navigate('/');
    }
  }, [navigate]);

  async function fetchAccessToken(code) {
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: REDIRECT_URI,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        }),
      });

      const data = await response.json();
      const accessToken = data.access_token;

      if (accessToken) {
        console.log("Spotify Token erhalten:", accessToken);
        localStorage.setItem('spotifyAccessToken', accessToken);

        setTimeout(() => {
          navigate('/playlistSetupHitster'); // Direkt zu Playlist-Auswahl
        }, 50);
      } else {
        console.error('Fehler beim Abrufen des Access Tokens:', data);
        navigate('/');
      }
    } catch (error) {
      console.error('Fehler beim Abrufen des Tokens:', error);
      navigate('/');
    }
  }

  return <div>Lade Spotify Login...</div>;
};

export default Callback;