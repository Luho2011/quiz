import React from 'react'
import {useState, useEffect} from "react";
import {doc, onSnapshot, setDoc, updateDoc} from 'firebase/firestore'
import {db} from '../firebase'
import Counter from "../Counter";
import "./Celeb.css"
import questions from "../TrueFalse.json"

const TEAMS = ['A', 'B'];
const gameRef = doc(db, 'trueFalseGame', 'current');

function Celeb() {
  const [remaining, setRemaining] = useState(questions);
  const [game, setGame] = useState(null);
  const [error, setError] = useState('');

  // Spielstand live aus Firestore (Tablets schreiben ihre Antworten dorthin)
  useEffect(() => {
    return onSnapshot(
      gameRef,
      snap => setGame(snap.exists() ? snap.data() : null),
      err => setError(err.message)
    );
  }, []);

  const question = game ? questions.find(q => q.ids === game.questionId) : null;
  const revealed = !!game?.revealed;
  const submittedTeams = TEAMS.filter(t => game?.answers?.[t]);
  const allSubmitted = !!game && submittedTeams.length === TEAMS.length;

  const handleStart = async () => {
    // Alle Fragen gespielt -> Start macht nichts mehr
    if (remaining.length === 0) return;
    const chosen = remaining[Math.floor(Math.random() * remaining.length)];
    setRemaining(remaining.filter(item => item.ids !== chosen.ids));
    try {
      await setDoc(gameRef, {questionId: chosen.ids, answers: {}, revealed: false});
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }

  const handleReveal = async () => {
    try {
      await updateDoc(gameRef, {revealed: true});
    } catch (e) {
      setError(e.message);
    }
  }

  const answerClass = (answer) => {
    if (!revealed) return 'celeb__answer';
    return `celeb__answer ${answer.correct ? 'celeb__answer--correct' : 'celeb__answer--wrong'}`;
  }

  const status = () => {
    if (!game) return '';
    if (revealed) return 'Aufgelöst';
    if (allSubmitted) return 'Alle Teams haben abgegeben';
    return TEAMS.map((t, i) => (
      <React.Fragment key={t}>
        {i > 0 && ' · '}
        <span className={`celeb__status-team celeb__status-team--${t}`}>Team {t}</span>
        {submittedTeams.includes(t) ? ' ✔' : ' wartet…'}
      </React.Fragment>
    ));
  }

  // Marker links (Team A) bzw. rechts (Team B) neben der Antwort.
  // Erst sichtbar, wenn beide abgegeben haben; nach dem Auflösen grün/rot.
  const teamSlot = (t, answer) => {
    const picked = allSubmitted && game.answers[t].includes(answer.id);
    let cls = `celeb__team-marker celeb__team-marker--${t}`;
    if (revealed) cls += answer.correct ? ' celeb__team-marker--correct' : ' celeb__team-marker--wrong';
    return (
      <div className='celeb__team-slot'>
        {picked && <span className={cls}>Team {t}</span>}
      </div>
    );
  }

  return (
    <div className='celeb'>
      <div className='celeb__counter'>
        <Counter/>
      </div>
      <div className='celeb__header'>
        <h1>Wahr oder falsch?</h1>
        <div className='celeb__buttons'>
          <button className='celeb__button' onClick={handleStart} disabled={remaining.length === 0}>Start</button>
          <button className='celeb__button' onClick={handleReveal} disabled={!question || !allSubmitted || revealed}>Auflösen</button>
        </div>
        {remaining.length === 0 && <p className='celeb__status'>Alle Fragen wurden gespielt.</p>}
        {error && <p className='celeb__error'>{error}</p>}
      </div>
      <div className='celeb__stage'>
        {question && (
          <>
            <h2 className='celeb__statement' key={question.ids}>{question.statement}</h2>
            <p className='celeb__status'>{status()}</p>
            <ul className='celeb__answers'>
              {question.answers.map(answer => (
                <li className='celeb__row' key={answer.id}>
                  {teamSlot('A', answer)}
                  <div className={answerClass(answer)}>
                    <span className='celeb__answer-letter'>{answer.id}</span>
                    <span className='celeb__answer-text'>{answer.text}</span>
                    {revealed && <span className='celeb__answer-mark'>{answer.correct ? '✅' : '❌'}</span>}
                  </div>
                  {teamSlot('B', answer)}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}

export default Celeb
