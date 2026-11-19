import React from 'react'
import {useState, useEffect} from "react";
import {doc, onSnapshot, setDoc, updateDoc} from 'firebase/firestore'
import {geoInterpolate} from 'd3-geo'
import {db} from '../firebase'
import Counter from "../Counter";
import WorldMap, {distanceKm, formatKm} from "../WorldMap";
import "./WhereIsIt.css"
import questions from "../WhereIsIt.json"

const TEAMS = ['A', 'B'];
const TEAM_COLORS = {A: '#3b82f6', B: '#ef4444'};
const TARGET_COLOR = '#facc15';
const LINES_DELAY = 1500;     // nach dem Ziel: Pause, bis die Linien starten
const LINES_DURATION = 1500;  // so lange wachsen die Linien
const RESULTS_DELAY = LINES_DELAY + LINES_DURATION + 200; // danach km + Gewinner
const gameRef = doc(db, 'whereGame', 'current');

function WhereIsIt() {
  const [game, setGame] = useState(null);
  const [loaded, setLoaded] = useState(false); // erst nach dem ersten Firestore-Stand ist "gespielt" bekannt
  const [error, setError] = useState('');
  // Ablauf nach dem Auflösen: Ziel -> Linien wachsen -> Ergebnis
  const [linesOn, setLinesOn] = useState(false);
  const [lineT, setLineT] = useState(0);
  const [resultsOn, setResultsOn] = useState(false);

  // Spielstand live aus Firestore (Tablets schreiben ihre Tipps dorthin)
  useEffect(() => {
    return onSnapshot(
      gameRef,
      snap => {
        setGame(snap.exists() ? snap.data() : null);
        setLoaded(true);
      },
      err => setError(err.message)
    );
  }, []);

  // Gespielte Fragen stehen in Firestore, damit sie ein Neuladen der Seite überstehen
  const played = game?.played ?? [];
  const remaining = questions.filter(q => !played.includes(q.ids));

  const question = game ? questions.find(q => q.ids === game.questionId) : null;
  const guessesShown = !!game?.guessesShown && !!question;
  const revealed = !!game?.revealed && !!question;
  const submittedTeams = TEAMS.filter(t => game?.answers?.[t]);
  const allSubmitted = !!game && submittedTeams.length === TEAMS.length;

  // Zeitgesteuerte Auflösung (Linien ziehen, dann Ergebnis einblenden)
  const questionId = game?.questionId;
  useEffect(() => {
    setLinesOn(false);
    setLineT(0);
    setResultsOn(false);
    if (!revealed) return;

    let raf;
    let startTime;
    const tick = (now) => {
      if (startTime === undefined) startTime = now;
      const p = Math.min(1, (now - startTime) / LINES_DURATION);
      setLineT(1 - Math.pow(1 - p, 3)); // ease-out
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    const t1 = setTimeout(() => {
      setLinesOn(true);
      raf = requestAnimationFrame(tick);
    }, LINES_DELAY);
    const t2 = setTimeout(() => setResultsOn(true), RESULTS_DELAY);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      cancelAnimationFrame(raf);
    };
  }, [revealed, questionId]);

  const handleStart = async () => {
    if (!loaded || remaining.length === 0) return;
    const chosen = remaining[Math.floor(Math.random() * remaining.length)];
    try {
      await setDoc(gameRef, {
        questionId: chosen.ids,
        answers: {},
        guessesShown: false,
        revealed: false,
        played: [...played, chosen.ids],
      });
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }

  // Alle Fragen wieder freigeben (neues Spiel)
  const handleReset = async () => {
    if (!window.confirm('Alle Fragen wieder freigeben?')) return;
    try {
      await setDoc(gameRef, {played: [], answers: {}, guessesShown: false, revealed: false});
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }

  // Erster Druck: Tipps zeigen. Zweiter Druck: Ziel + Auflösung.
  const handleReveal = async () => {
    try {
      await updateDoc(gameRef, game?.guessesShown ? {revealed: true} : {guessesShown: true});
    } catch (e) {
      setError(e.message);
    }
  }

  // Tipps + Entfernungen + Gewinner
  const guesses = TEAMS.filter(t => game?.answers?.[t]).map(t => ({team: t, guess: game.answers[t]}));
  const results = question ? guesses.map(g => ({...g, km: distanceKm(g.guess, question)})) : [];
  const best = results.length ? Math.min(...results.map(r => r.km)) : null;
  const winners = results.filter(r => Math.round(r.km) === Math.round(best)).map(r => r.team);
  const isTie = results.length > 1 && winners.length === results.length;

  const markers = [];
  if (guessesShown) {
    guesses.forEach(g => markers.push({...g.guess, color: TEAM_COLORS[g.team]}));
  }
  if (revealed) {
    markers.push({lat: question.lat, lon: question.lon, color: TARGET_COLOR, label: question.name});
  }

  // Linien wachsen vom Tipp zum Ziel (entlang des Großkreises)
  const lines = (revealed && linesOn)
    ? guesses.map(g => {
        const [lon, lat] = geoInterpolate([g.guess.lon, g.guess.lat], [question.lon, question.lat])(lineT);
        return {from: g.guess, to: {lat, lon}, color: TEAM_COLORS[g.team]};
      })
    : [];

  let focus = [];
  if (revealed) focus = [question, ...guesses.map(g => g.guess)];
  else if (guessesShown) focus = guesses.map(g => g.guess);

  const status = () => {
    if (!game) return '';
    if (allSubmitted) return 'Alle Teams haben abgegeben';
    return TEAMS.map((t, i) => (
      <React.Fragment key={t}>
        {i > 0 && ' · '}
        <span className={`whereisit__status-team whereisit__status-team--${t}`}>Team {t}</span>
        {submittedTeams.includes(t) ? ' ✔' : ' wartet…'}
      </React.Fragment>
    ));
  }

  return (
    <div className='whereisit'>
      <div className='whereisit__counter'>
        <Counter/>
      </div>
      <div className='whereisit__header'>
        <h1>Wo ist es?</h1>
        <div className='whereisit__buttons'>
          <button className='whereisit__button' onClick={handleStart} disabled={!loaded || remaining.length === 0}>Start</button>
          <button className='whereisit__button' onClick={handleReveal} disabled={!question || !allSubmitted || revealed}>Auflösen</button>
        </div>
        {guessesShown && !revealed && <p className='whereisit__hint'>Tipps werden gezeigt – nochmal „Auflösen“ drücken</p>}
        {loaded && (
          <p className='whereisit__hint'>
            {remaining.length === 0
              ? 'Alle Fragen wurden gespielt.'
              : `Noch ${remaining.length} von ${questions.length} Fragen`}
            {played.length > 0 && <> · <button className='whereisit__reset' onClick={handleReset}>Zurücksetzen</button></>}
          </p>
        )}
        {error && <p className='whereisit__error'>{error}</p>}
      </div>
      <div className='whereisit__stage'>
        {question && <h2 className='whereisit__question' key={question.ids}>{question.question}</h2>}
        {question && !guessesShown && <p className='whereisit__status'>{status()}</p>}
        {revealed && (
          <p className='whereisit__answer'>
            Antwort: <strong>{question.answer}</strong>
            {question.answer !== question.name && <> – {question.name}</>}
          </p>
        )}
        {revealed && resultsOn && (
          <div className='whereisit__results'>
            {results.map(r => (
              <div
                key={r.team}
                className={`whereisit__result whereisit__result--${r.team} ${!isTie && winners.includes(r.team) ? 'whereisit__result--winner' : ''}`}
              >
                <span className='whereisit__result-team'>Team {r.team}</span>
                <span className='whereisit__result-km'>{formatKm(r.km)}</span>
                {!isTie && winners.includes(r.team) && <span className='whereisit__result-badge'>näher dran 🏆</span>}
              </div>
            ))}
            {isTie && <div className='whereisit__tie'>Unentschieden!</div>}
          </div>
        )}
        <WorldMap
          markers={markers}
          lines={lines}
          focus={focus}
          resetKey={game?.questionId}
        />
      </div>
    </div>
  )
}

export default WhereIsIt
