import React, { useEffect } from 'react'
import Counter from "../Counter";
import "./Zoom.css";
import list from "../Sort.json";
import {useState} from "react";
import {DragDropContext, Droppable, Draggable} from "react-beautiful-dnd";
import {db} from '../firebase'
import {getDocs, collection, collectionGroup} from 'firebase/firestore'

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}


function Zoom() {

  const [words, setWords] = useState(list);
  const [wordsTest, setWordsTest] = useState([]);
  const [remainingWords, setRemainingWords] = useState([]);
  const [solutionList, setSolutionList] = useState([]);
  const [solution, setSolution] = useState([]);
  const [showSolution, setShowSolution] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [fetchData, setFetchData] = useState(false);
  const [newList, setNewList] = useState([]);
  const [usedNumbers, setUsedNumbers] = useState([]);

  

  useEffect(() => {
    const getCollectionSize = async () => {
      const rnd = getRandomNumber();
      const wordsCollection = collection(db, `sort/B5WJdSrsvNUlCEtcjG1p/${rnd}`);
      const data = await getDocs(wordsCollection);
      
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
      
      }));

      setWordsTest(shuffleArray(filteredData));
      const newSolution = filteredData.slice();
      setSolution(newSolution)
      console.log(filteredData)
      setSolutionList([]);
      setShowSolution(false);
      
    };
    getCollectionSize();
  }, [fetchData]);


  const getRandomNumber = () => {
    let rnd;
    do {
      rnd = Math.floor(Math.random() * 50) + 1;
    } while (usedNumbers.includes(rnd));
    setUsedNumbers(prevState => [...prevState, rnd]);
    return rnd;
  };
  

  const handleNext = () => {
    console.log(words.length)
    const random = Math.floor(Math.random() * words.length);
    setRemainingWords(words[random].items);
    const newSolution = words[random].items.slice();
    setSolution(newSolution);
    setSolutionList([]);
    setShowSolution(true);
    remove(words[random].ids);
    console.log(remainingWords)
  };

  const sortedSolution = solution.slice().sort((a, b) => a.id - b.id);
  

  const remove = (id) => {
    const newList1 = newList.filter(item => item.id !== id);
    setNewList(newList1);
    console.log(newList.length)
  }



  const onDragEnd = (result) => {
    console.log(result);
    const { source, destination } = result;
  
    if (!destination) {
      return;
    }
  
    if (source.index === destination.index && source.droppableId === destination.droppableId) {
      return;
    }
  
    if (source.droppableId !== destination.droppableId) {
  
      const solution = [...solutionList];
  
      const sourceIndex = source.index;
      const destinationIndex = destination.index;
  
      const [removedItem] = wordsTest.splice(sourceIndex, 1);
      
  
      if (removedItem.category !== destination.droppableId.toString()) {
        solution.splice(destinationIndex, 0, removedItem);
  
        // Check the position validity after each drag
        const isValidPosition = checkPositionValidity(removedItem, destinationIndex);
        setDraggedItemIndex(isValidPosition ? null : destinationIndex);
        
          if (!isValidPosition) {
            console.error('Invalid position!'); 
            
          } 
        setSolutionList(solution);        
      }      
    }
  };

  const checkPositionValidity = (movedItem, destinationIndex) => {
    const itemsAbove = solutionList.slice(0, destinationIndex);
    const itemsBelow = solutionList.slice(destinationIndex);
  
    // Check the validity of the position
    const isValidPosition =
      (itemsAbove.every(item => item.id < movedItem.id) || itemsAbove.length === 0) &&
      (itemsBelow.every(item => item.id > movedItem.id) || itemsBelow.length === 0);
  
    return isValidPosition;
  };

 
  return (
    <div className="zoom">
       <DragDropContext onDragEnd={onDragEnd}>           
                          <div className='boxes'>
                            <div className='zoom__counter'>
                               <Counter/> 
                            </div>                                                         
                            <Droppable droppableId="a" type="droppableItem">
                              {(provided) => (
                                <div ref={provided.innerRef}>
                                <div className="zoom__words">
                                    <div className='left_side'>
                                        <div className='zoom__buttons'>
                                          <button className='play_button' onClick={() => setFetchData(!fetchData)}>Next</button>
                                          <button className='play_button' onClick={() => setShowSolution(!showSolution)}>Solution</button>
                                        </div> 
                                        {wordsTest.map((item) => (
                                            <div className='specific'>
                                                <h2>{item.specific}</h2> 
                                            </div>                                                             
                                        ))} 
                                    </div>                                  
                                 {wordsTest.map((item, index) => (                                                                                         
                                    <Draggable
                                      draggableId={(item.id || index).toString()}
                                      key={item.id || index}
                                      index={index}
                                    >
                                      {(provided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                        >                                                                                                                                                                                              
                                           <div className='words'>                                    
                                              <h2>{item.name}</h2>
                                           </div>                                    
                                        </div>
                                      )}
                                    </Draggable>                                
                                  ))}
                                  {provided.placeholder}                                                            
                               </div>
                               </div>
                             )}
                            </Droppable> 
                        
                          <Droppable droppableId="b" type="droppableItem">
                             {(provided) => (
                               <div ref={provided.innerRef}>
                                  <div className='zoom__list'> 
                                      {wordsTest.map((item) => (
                                        <div className='category1'>
                                            <h2>{item.category1}</h2>      
                                        </div>                                                             
                                      ))}
                                     {solutionList                             
                                       .map((item, index) => (
                                        <Draggable
                                          draggableId={item.id}
                                          key={item.id}
                                          index={index} 
                                        >
                                          {(provided) => (
                                            <div                                          
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            >
                                              <div className={index === draggedItemIndex ? "wordsInvalid" : "wordsValid"}>
                                                 <h2>{item.name}</h2>                                                                                                                                                                                                                                                                                    
                                              </div> 
                                            </div>
                                          )}                                                                                                                
                                      </Draggable>  
                                    ))}
                                     {provided.placeholder}
                                     {wordsTest.map((item) => (
                                        <div className='category2'>
                                            <h2>{item.category2}</h2>      
                                        </div> 
                                        ))}
                                  </div>                                            
                               </div>
                                 )}
                            </Droppable>   
                          <div className='zoom__solution'>
                                {sortedSolution.map((item) => (
                                  <div className={showSolution ? "no__solution" : "words__solution"}>
                                      <h2>{item.name} ({item.solution})</h2>                                    
                                  </div>                      
                                ))}
                          </div>                                                                                                                                                                                       
              </div>              
        </DragDropContext>    
    </div>      
  );
  
}

export default Zoom