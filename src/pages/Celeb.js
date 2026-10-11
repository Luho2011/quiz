import React from 'react'
import {useState} from "react";
import Counter from "../Counter";
import "./Celeb.css"
import places from "../Places.json"


function Celeb() {
  const [placeList, setPlaceList] = useState(places);
  const [place, setPlace] = useState();
  const [hintIndex, setHintIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);

  const visibleHints = place ? place.hints.slice(0, hintIndex) : [];
  const images = visibleHints.filter(hint => hint.type === "image");
  const audios = visibleHints.filter(hint => hint.type === "audio");
  const allHintsShown = !place || hintIndex >= place.hints.length;
  const currentImage = images[imageIndex];

  const handleStart = () => {
    // Liste leer -> alle Orte wieder zur Auswahl freigeben
    const available = placeList.length > 0 ? placeList : places;
    const random = Math.floor(Math.random() * available.length);
    const chosen = available[random];
    setPlace(chosen);
    setHintIndex(0);
    setImageIndex(0);
    setPlaceList(available.filter(item => item.id !== chosen.id));
  }

  const handleHint = () => {
    if (allHintsShown) return;
    // neues Bild -> direkt anzeigen, Audio -> aktuelles Bild bleibt
    if (place.hints[hintIndex].type === "image") {
      setImageIndex(images.length);
    }
    setHintIndex(hintIndex + 1);
  }

  return (
    <div className='celeb'>
      <div className='celeb__counter'>
        <Counter/>
      </div>
      <div className='celeb__header'>
        <h1>Wo bin ich?</h1>
        <div className='celeb__buttons'>
          <button className='celeb__button' onClick={handleStart}>Start</button>
          <button className='celeb__button' onClick={handleHint} disabled={allHintsShown}>Hint</button>
        </div>
      </div>
      <div className='celeb__stage'>
        <div className='celeb__images'>
          {currentImage && (
            <img className='celeb__image' key={currentImage.src} src={currentImage.src} alt="" />
          )}
          {images.length > 1 && (
            <div className='celeb__nav'>
              <button className='celeb__nav-button' onClick={() => setImageIndex(imageIndex - 1)} disabled={imageIndex === 0}>‹</button>
              <span>{imageIndex + 1} / {images.length}</span>
              <button className='celeb__nav-button' onClick={() => setImageIndex(imageIndex + 1)} disabled={imageIndex === images.length - 1}>›</button>
            </div>
          )}
        </div>
        <div className='celeb__audio'>
          {audios.length === 0 && <p></p>}
          {audios.map(hint => (
            <audio className='celeb__player' key={hint.src} src={hint.src} controls />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Celeb
