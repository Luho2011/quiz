import React from 'react'
import {useState, useEffect} from "react";
import {useNavigate, useParams} from 'react-router-dom'
import {doc, onSnapshot, updateDoc} from 'firebase/firestore'
import {db} from '../firebase'
import "./CelebPlay.css"
import questions from "../TrueFalse.json"

const TEAMS = ['A', 'B'];
const gameRef = doc(db, 'trueFalseGame', 'current');

function CelebPlay() {
  // Das Team steht in der URL (/celeb/play/A), damit es nach einem Refresh erhalten bleibt
  const params = useParams();
  const navigate = useNavigate();
  const teamParam = (params.team || '').toUpperCase();
  const team = TEAMS.includes(teamParam) ? teamParam : null;
  const [game, setGame] = useState(null);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    return onSnapshot(
      gameRef,
      snap => setGame(snap.exists() ? snap.data() : null),
      err => setError(err.message)
    );
  }, []);

  // Neue Frage -> Auswahl zurücksetzen
  const questionId = game?.questionId;
  useEffect(() => {
    setSelected([]);
  }, [questionId]);

  const chooseTeam = (t) => {
    navigate(t ? `/celeb/play/${t}` : '/celeb/play');
  }

  const toggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  const handleConfirm = async () => {
    if (!window.confirm('Antworten abgeben? Danach lässt sich nichts mehr ändern.')) return;
    try {
      await updateDoc(gameRef, {[`answers.${team}`]: selected});
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }

  if (!team) {
    return (
      <div className='celebplay'>
        <h1>Welches Team seid ihr?</h1>
        <div className='celebplay__teams'>
          {TEAMS.map(t => (
            <button key={t} className={`celebplay__team-button celebplay__team-button--${t}`} onClick={() => chooseTeam(t)}>Team {t}</button>
          ))}
        </div>
      </div>
    );
  }

  const question = game ? questions.find(q => q.ids === game.questionId) : null;
  const submitted = !!game?.answers?.[team];
  const revealed = !!game?.revealed;
  const myTurn = !!question && !submitted && !revealed;
  const mine = game?.answers?.[team] ?? [];

  let message = '';
  if (!question) message = 'Warte auf Start…';
  else if (revealed) message = 'Aufgelöst – schau auf den Fernseher';
  else if (submitted) message = 'Abgegeben ✔ – warte auf Auflösung';

  const answerClass = (answer) => {
    if (revealed) {
      return `celebplay__answer ${answer.correct ? 'celebplay__answer--correct' : 'celebplay__answer--wrong'}`;
    }
    return `celebplay__answer${selected.includes(answer.id) ? ' celebplay__answer--selected' : ''}`;
  }

  return (
    <div className={`celebplay celebplay--${team}`}>
      <div className='celebplay__top'>
        <span className='celebplay__team'>Team {team}</span>
        <button className='celebplay__link' onClick={() => chooseTeam(null)}>Team wechseln</button>
      </div>
      {error && <p className='celebplay__error'>{error}</p>}
      {message && <p className='celebplay__message'>{message}</p>}
      {question && (myTurn || revealed) && (
        <>
          <h2 className='celebplay__statement'>{question.statement}</h2>
          <p className='celebplay__hint'>
            {revealed ? `Auflösung (Marker = Tipp von Team ${team})` : 'Tippe alle Aussagen an, die wahr sind.'}
          </p>
          <ul className='celebplay__answers'>
            {question.answers.map(answer => (
              <li className='celebplay__row' key={answer.id}>
                <button
                  className={answerClass(answer)}
                  onClick={() => myTurn && toggle(answer.id)}
                  disabled={!myTurn}
                >
                  <span className='celebplay__letter'>{answer.id}</span>
                  <span className='celebplay__text'>{answer.text}</span>
                </button>
                {revealed && (
                  <div className='celebplay__marker-slot'>
                    {mine.includes(answer.id) && <span className='celebplay__marker'>Team {team}</span>}
                  </div>
                )}
              </li>
            ))}
          </ul>
          {myTurn && (
            <button className='celebplay__confirm' onClick={handleConfirm}>Bestätigen</button>
          )}
        </>
      )}
    </div>
  )
}

export default CelebPlay
