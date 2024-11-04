import React from 'react'
import "./Association.css";
import {useState} from "react";
import wordsData from "../WordsAssociation.json"

function Association() {

    const [words, setWords] = useState([]);
    const [currentWord, setCurrentWord] = useState("");
  
    const start = () => {
      setWords([...wordsData]); 
      setCurrentWord(wordsData[0]);
    };
  
    
    const next = () => {
      if (words.length > 1) {
        const newWords = words.slice(1); 
        setWords(newWords);
        setCurrentWord(newWords[0]);
      } else {
        alert("Keine Wörter mehr übrig.");
        setWords([]);
      }
    };


  return (
    <div className="Association">
        <h1>Association</h1>
        <div className='Association__buttons'>
            <button className='Association__button' onClick={start}>Start</button>
            <button className='Association__button' onClick={next}>Next</button>
        </div>
        <div className='currentWord'>
            <h1>{currentWord}</h1>
        </div>
    </div>
);
}

export default Association