import React, { useState, useRef, useEffect } from 'react';
import "./WhoKnowsMore.css";
import Counter from "../Counter";
import words1 from "../whoknowsmore.json";

// Klein schreiben, Umlaute auflösen, alle Satz-/Leerzeichen entfernen (nur Buchstaben und Ziffern zählen)
const normalize = (s) =>
    s.toLowerCase()
        .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
        .normalize('NFD').replace(/[̀-ͯ]/g, '')  // übrige Akzente (é, ã, í …) entfernen
        .replace(/[^a-z0-9]/g, '');

// Kurze Töne per Web Audio (keine Audiodateien nötig)
let audioCtx = null;
const getAudio = () => {
    if (!audioCtx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        audioCtx = new Ctx();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
};

// Ein Ton mit sanftem Attack, Filter, optionalem Pitch-Glide und leichtem Detune-Layer
const playTone = (ctx, out, { freq, start = 0, duration = 0.3, type = 'sine', volume = 0.2, glideTo, cutoff = 8000, detune = 0 }) => {
    const t = ctx.currentTime + start;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    filter.connect(gain);
    gain.connect(out);

    [-detune, detune].forEach((d) => {
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + duration);
        osc.detune.value = d;
        osc.connect(filter);
        osc.start(t);
        osc.stop(t + duration + 0.05);
    });
};

// Ausgang mit kurzem Echo, damit es "räumlicher" klingt
const createOutput = (ctx, echoTime, echoAmount) => {
    const master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);

    const delay = ctx.createDelay();
    delay.delayTime.value = echoTime;
    const feedback = ctx.createGain();
    feedback.gain.value = echoAmount;
    const wet = ctx.createGain();
    wet.gain.value = 0.35;
    master.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(ctx.destination);
    return master;
};

const playResultSound = (correct) => {
    const ctx = getAudio();
    if (!ctx) return;
    const out = createOutput(ctx, correct ? 0.16 : 0.12, correct ? 0.4 : 0.25);

    if (correct) {
        // Funkelndes Dur-Arpeggio (C-E-G-C) mit hellem Abschluss
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, i) => {
            playTone(ctx, out, { freq, start: i * 0.07, duration: 0.45, type: 'triangle', volume: 0.22, detune: 6 });
        });
        playTone(ctx, out, { freq: 2093, start: 0.28, duration: 0.6, type: 'sine', volume: 0.1 });
    } else {
        // Absteigender "Fail"-Sweep plus dumpfer Bass-Schlag
        playTone(ctx, out, { freq: 330, glideTo: 110, start: 0, duration: 0.55, type: 'sawtooth', volume: 0.2, cutoff: 1200, detune: 10 });
        playTone(ctx, out, { freq: 220, glideTo: 82, start: 0.18, duration: 0.6, type: 'sawtooth', volume: 0.18, cutoff: 900, detune: 10 });
        playTone(ctx, out, { freq: 70, glideTo: 40, start: 0, duration: 0.5, type: 'sine', volume: 0.5 });
    }
};

function WhoKnowsMore() {
    const [words, setWords] = useState(words1);
    const [remainingWords, setRemainingWords] = useState([]);
    const [visible, setVisible] = useState([]);  // Zustand für die Sichtbarkeit
    const [guess, setGuess] = useState('');
    const [alertInfo, setAlertInfo] = useState(null);  // { text } – nur für falsche Begriffe
    const [pending, setPending] = useState(false);     // Eingabe gesperrt, solange eine Prüfung läuft
    const timerRef = useRef(null);
    const rootRef = useRef(null);

    // Browser-Zoom (Strg + Mausrad) erkennen: --z = 1 bei 100 % / Reinzoomen, <1 beim Rauszoomen
    useEffect(() => {
        const update = () => {
            let z = window.outerWidth / window.innerWidth;
            if (!isFinite(z) || z > 0.97) z = 1;
            if (rootRef.current) rootRef.current.style.setProperty('--z', Math.max(z, 0.2));
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    const handleStart = () => {
        const random = Math.floor(Math.random() * words.length);
        const selectedWords = words[random].items;
        setRemainingWords(selectedWords);
        setVisible(new Array(selectedWords.length).fill(false));  // Initialisiert die Sichtbarkeit mit false
        remove(words[random].ids);
    };

    const remove = (id) => {
        const newList = words.filter(item => item.ids !== id);
        setWords(newList);
    };

    useEffect(() => () => clearTimeout(timerRef.current), []);

    const handleGuess = (e) => {
        e.preventDefault();
        const text = guess.trim();
        if (!text || remainingWords.length === 0 || pending) return;

        const needle = normalize(text);
        const matchIndex = remainingWords.findIndex((item, index) =>
            !visible[index] &&
            [item.name, ...(item.aliases || [])].some(n => normalize(n) === needle)
        );
        const alreadyGuessed = matchIndex === -1 && remainingWords.some((item, index) =>
            visible[index] &&
            [item.name, ...(item.aliases || [])].some(n => normalize(n) === needle)
        );
        if (alreadyGuessed) {
            setGuess('');
            return;
        }

        setGuess('');
        setPending(true);
        getAudio(); // Audio beim Absenden (Nutzeraktion) freischalten
        // Für die Spannung: Ergebnis erst nach 3 Sekunden
        timerRef.current = setTimeout(() => {
            playResultSound(matchIndex !== -1);
            if (matchIndex !== -1) {
                // Richtig: Karte einfach umdrehen, kein Alert
                setVisible(prev => {
                    const next = [...prev];
                    next[matchIndex] = true;
                    return next;
                });
                setPending(false);
            } else {
                // Falsch: roter Alert, danach wieder eingabebereit
                setAlertInfo({ text });
                timerRef.current = setTimeout(() => {
                    setAlertInfo(null);
                    setPending(false);
                }, 2000);
            }
        }, 2000);
    };

    const toggleVisibility = (index) => {
        const newVisible = [...visible];
        newVisible[index] = !newVisible[index];
        setVisible(newVisible);
    };

    return (
        <div className='more' ref={rootRef}>
            <div className='more__counter'>
                <Counter />
            </div>
            <div className='more__title'>
                <h1>Last Man Standing</h1>
            </div>
            <form className='more__form' onSubmit={handleGuess}>
                <input
                    className='more__input'
                    type='text'
                    placeholder='Begriff eingeben…'
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                />
                <button className='more__button' type='submit'>OK</button>
                <button className='more__button' onClick={handleStart}>start</button>
            </form>
            <div className='more__content'>
                {remainingWords.length > 0 && (
                    <div className='more__category'>
                        <h3>{remainingWords[0].title}</h3>
                    </div>
                )}
                {remainingWords.map((item, index) => (
                    <div key={index} className={`more__names${visible[index] ? ' more__names--revealed' : ''}`} onClick={() => toggleVisibility(index)}>
                        <h2>{visible[index] ? item.name : ''}</h2>
                    </div>
                ))}
            </div>
            {alertInfo && (
                <div className='more__alert-backdrop'>
                    <div className='more__alert more__alert--wrong'>
                        {alertInfo.text}
                    </div>
                </div>
            )}
        </div>
    );
}

export default WhoKnowsMore;