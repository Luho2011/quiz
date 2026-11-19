import React from 'react'
import {useState, useEffect} from "react";
import {useNavigate, useParams} from 'react-router-dom'
import {doc, onSnapshot, updateDoc} from 'firebase/firestore'
import {db} from '../firebase'
import WorldMap, {distanceKm, formatKm} from "../WorldMap";
import "./WhereIsItPlay.css"
import questions from "../WhereIsIt.json"

const TEAMS = ['A', 'B'];
const TEAM_COLORS = {A: '#3b82f6', B: '#ef4444'};
const TARGET_COLOR = '#facc15';
const gameRef = doc(db, 'whereGame', 'current');

function WhereIsItPlay() {
  // Das Team steht in der URL (/whereIsIt/play/A), damit es nach einem Refresh erhalten bleibt
  const params = useParams();
  const navigate = useNavigate();
  const teamParam = (params.team || '').toUpperCase();
  const team = TEAMS.includes(teamParam) ? teamParam : null;
  const [game, setGame] = useState(null);
  const [picked, setPicked] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    return onSnapshot(
      gameRef,
      snap => setGame(snap.exists() ? snap.data() : null),
      err => setError(err.message)
    );
  }, []);

  // Neue Frage -> Marker zurücksetzen
  const questionId = game?.questionId;
  useEffect(() => {
    setPicked(null);
  }, [questionId]);

  const chooseTeam = (t) => {
    navigate(t ? `/whereIsIt/play/${t}` : '/whereIsIt/play');
  }

  const handleConfirm = async () => {
    if (!picked) return;
    if (!window.confirm('Tipp abgeben? Danach lässt sich nichts mehr ändern.')) return;
    try {
      await updateDoc(gameRef, {[`answers.${team}`]: {lat: picked.lat, lon: picked.lon}});
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }

  if (!team) {
    return (
      <div className='whereplay'>
        <h1>Welches Team seid ihr?</h1>
        <div className='whereplay__teams'>
          {TEAMS.map(t => (
            <button key={t} className={`whereplay__team-button whereplay__team-button--${t}`} onClick={() => chooseTeam(t)}>Team {t}</button>
          ))}
        </div>
      </div>
    );
  }

  const question = game ? questions.find(q => q.ids === game.questionId) : null;
  const mine = game?.answers?.[team] ?? null;
  const submitted = !!mine;
  const revealed = !!game?.revealed && !!question;
  const myTurn = !!question && !submitted && !revealed;

  let message = '';
  if (!question) message = 'Warte auf Start…';
  else if (revealed) {
    const answerText = question.answer === question.name ? question.answer : `${question.answer} (${question.name})`;
    message = mine ? `${answerText} – ihr lagt ${formatKm(distanceKm(mine, question))} daneben` : `${answerText} – schau auf den Fernseher`;
  }
  else if (game?.guessesShown) message = 'Die Tipps werden gezeigt – schau auf den Fernseher 👀';
  else if (submitted) message = 'Abgegeben ✔ – warte auf Auflösung';

  const own = myTurn ? picked : mine;
  const markers = [];
  if (own) markers.push({...own, color: TEAM_COLORS[team]});
  if (revealed) markers.push({lat: question.lat, lon: question.lon, color: TARGET_COLOR, label: question.name});
  const lines = revealed && mine ? [{from: mine, to: question, color: TEAM_COLORS[team]}] : [];
  const focus = revealed ? [question, ...(mine ? [mine] : [])] : [];

  return (
    <div className={`whereplay whereplay--${team}`}>
      <div className='whereplay__top'>
        <span className='whereplay__team'>Team {team}</span>
        <button className='whereplay__link' onClick={() => chooseTeam(null)}>Team wechseln</button>
      </div>
      {error && <p className='whereplay__error'>{error}</p>}
      {question && <h2 className='whereplay__question'>{question.question}</h2>}
      {message && <p className='whereplay__message'>{message}</p>}
      {myTurn && <p className='whereplay__hint'>Mit zwei Fingern zoomen und verschieben · Tippen setzt euren Marker</p>}
      {question && (
        <WorldMap
          markers={markers}
          lines={lines}
          focus={focus}
          resetKey={questionId}
          onPick={myTurn ? setPicked : undefined}
        />
      )}
      {myTurn && (
        <button className='whereplay__confirm' onClick={handleConfirm} disabled={!picked}>
          {picked ? 'Bestätigen' : 'Tippt auf die Karte'}
        </button>
      )}
    </div>
  )
}

export default WhereIsItPlay
