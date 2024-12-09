import React from 'react'
import {useState} from "react";
import "./History.css"
import images from "../History.json"
import Counter from "../Counter";


function History() {
  const [show, setShow] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [video, setVideo] = useState(null);
  const [name, setName] = useState(null);
  const [fact1, setFact1] = useState();
  const [fact2, setFact2] = useState();
  const [fact3, setFact3] = useState();
  const [fact4, setFact4] = useState();
  const [fact5, setFact5] = useState();
  const [fact6, setFact6] = useState();
  const [distance, setDistance] = useState();
  const [population, setPopulation] = useState();
  const [flag, setFlag] = useState();
  const [neighbour, setNeighbour] = useState();
  const [solution, setSolution] = useState(true);
  const [imageList, setImageList] = useState(images);

  

  const handleNext = () => {
    if (imageList.length > 0) {
      let random = Math.floor(Math.random() * imageList.length);
      setVideo(imageList[random].image);
      setName(imageList[random].name);
      setFact1(imageList[random].fact1)
      setFact2(imageList[random].fact2)
      setFact3(imageList[random].fact3)
      setFact4(imageList[random].fact4)
      setFact5(imageList[random].fact5)
      setFact6(imageList[random].fact6)
      setPopulation(imageList[random].population);
      setDistance(imageList[random].Entfernung);
      setFlag(imageList[random].flagge);
      setNeighbour(imageList[random].währung);
      remove(imageList[random].id);
      setSolution(true);
      setShow(true)
      setHintIndex(0);
    }
  };

  const remove = (id) => {
    const newList = imageList.filter(image => image.id !== id);
    setImageList(newList);
    console.log(newList);
  };

  const handleNextHint = () => {
    setHintIndex(prevIndex => prevIndex + 1);
  };
      

  return (
    <div className='history'>
        <div className='history__counter'>
           <Counter/> 
        </div> 
      <div className='headline__history'>
        <h2>Guess the Country</h2>
      </div>
      <div className='history_buttons'>
        <button className='play_button' onClick={handleNext}>Next</button>
        <button className='play_button' onClick={()=> setSolution(!solution)}>Solution</button>
        <button className='play_button' onClick={handleNextHint}>hint</button>
      </div>

      <div className='history__quiz'>
        <div className='pic__history'>
            {video && (
              <video className='countryShape' key={video} width="1050" controls>
              <source src={video} type="video/mp4" />
            </video>
              )} 
              <div className={solution ? "" : "history__solution"}>
                 <h1 className={solution ? "solution" : ""}>{name}</h1>
              </div> 
        </div>
              <div className={show ? "history__hints" : "show"}>
              <div className={`history__hintBox ${hintIndex >= 1 ? 'show' : ''}`}>
                      {hintIndex >= 1 && <h2>{fact1}</h2>}
                  </div>
                  <div className={`history__hintBox ${hintIndex >= 2 ? 'show' : ''}`}>
                      {hintIndex >= 2 && <h2>{fact2}</h2>}
                  </div>
                  <div className={`history__hintBox ${hintIndex >= 3 ? 'show' : ''}`}>
                      {hintIndex >= 3 && <h2>{fact3}</h2>}
                  </div>
                  <div className={`history__hintBox ${hintIndex >= 4 ? 'show' : ''}`}>
                      {hintIndex >= 4 && <h2>{fact4}</h2>}
                  </div>
                  <div className={`history__hintBox ${hintIndex >= 5 ? 'show' : ''}`}>
                      {hintIndex >= 5 && <h2>{fact5}</h2>}
                  </div>
                  <div className={`history__hintBox ${hintIndex >= 6 ? 'show' : ''}`}>
                      {hintIndex >= 6 && <h2>{fact6}</h2>}
                  </div>
                  <div className={`history__hintBox ${hintIndex >= 7 ? 'show' : ''}`}>
                      {hintIndex >= 7 && <h2>{population}</h2>}
                  </div>
                  <div className={`history__hintBox ${hintIndex >= 8 ? 'show' : ''}`}>
                     {hintIndex >= 8 && <h2>{distance}</h2>}
                  </div>
                  <div className={`history__hintBox ${hintIndex >= 9 ? 'show' : ''}`}>
                     {hintIndex >= 9 && <h2>{neighbour}</h2>}
                  </div>                 
                    {hintIndex >= 10 && <img src={flag}/>}

              </div>

      </div>
  
    </div>
  )
}

export default History;