import React, { useEffect } from 'react'
import "./Belong.css";
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


function Belong() {

  const [wordsTest, setWordsTest] = useState([]);
  const [wordsSolution, setWordsSolution] = useState([]);
  const [wordsBelong, setWordsBelong] = useState([]);
  const [solutionList, setSolutionList] = useState([]);
  const [solution, setSolution] = useState([]);
  const [solution2, setSolution2] = useState([]);
  const [showSolution, setShowSolution] = useState(false);
  const [fetchData, setFetchData] = useState(false);
  const [newList, setNewList] = useState([]);
  const [usedNumbers, setUsedNumbers] = useState([]);
  const [highlightedItems, setHighlightedItems] = useState({});


  useEffect(() => {
    const getCollectionSize = async () => {
      const rnd = getRandomNumber();
      const wordsCollection = collection(db, `sort/rvo0bgDUH9oHF6wlSE0q/${rnd}`);
      const wordsCollection2 = collection(db, `sort/gQCCfBS7HXdnnwDniuat/${rnd}`);
      const data = await getDocs(wordsCollection);
      
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
      
      }));

      const data2 = await getDocs(wordsCollection2);
      
      const filteredData2 = data2.docs.map((doc) => ({
        ...doc.data(),
      
      }));

      setWordsTest(shuffleArray(filteredData));
      setWordsBelong(filteredData2);
      const newSolution = filteredData.slice();
      setSolution(newSolution)
      const newSolution2 = filteredData2.slice();
      setSolution2(newSolution2)
      setSolutionList([]);
      setShowSolution(false);
      
    };
    getCollectionSize();
  }, [fetchData]);

  const sortedSolution = solution2.slice().sort((a, b) => a.id - b.id);
  const sortedSolution2 = solution.slice().sort((a, b) => a.check - b.check);


  const getRandomNumber = () => {
    let rnd;
    do {
      rnd = Math.floor(Math.random() * 31) + 1;
    } while (usedNumbers.includes(rnd));
    setUsedNumbers(prevState => [...prevState, rnd]);
    return rnd;
  };
  
  

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
  
      const solution = [...wordsBelong];
  
      const sourceIndex = source.index;
      const destinationIndex = destination.index;
  
      const [removedItem] = wordsTest.splice(sourceIndex, 1);
      
      if (removedItem.category !== destination.droppableId.toString()) {
        solution.splice(destinationIndex, 0, removedItem);
      }

      const isValidPosition = checkPositionValidity(removedItem, destinationIndex);
     
      
        if (!isValidPosition) {
          console.error('Invalid position!'); 
          setHighlightedItems((prevItems) => ({
            ...prevItems,
            [removedItem.id]: true,
          }));
        } else {
          setHighlightedItems((prevItems) => ({
            ...prevItems,
            [removedItem.id]: false,
          }));
        } 

       setWordsBelong(solution);  
    }
  };

  const checkPositionValidity = (movedItem, destinationIndex) => {
    const itemAbove = wordsBelong.slice(destinationIndex -1, destinationIndex);
  
    // Check the validity of the position
    const isValidPosition =
      (itemAbove.every(item => item.id === movedItem.check));
  
    return isValidPosition;
  };
 
  
 
  return (
    <div className="zoom">    
  
      <DragDropContext onDragEnd={onDragEnd}>
        <div className='boxes'>
          <Droppable droppableId="a" type="droppableItem">
            {(provided) => (
              <div ref={provided.innerRef}>
                    <div className='belong__buttons'>
                         <button className='belong__play_button' onClick={() => setFetchData(!fetchData)}>Next</button>
                         <button className='belong__play_button' onClick={() => setShowSolution(!showSolution)}>Solution</button>
                    </div>
                <div className="zoom__wordsBelong">
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
  
          <div className='belong__list'>
          <Droppable droppableId="b" type="droppableItem">
            {(provided) => (
              <div ref={provided.innerRef}>      
                    <div className='belong__words__div'>
                     {wordsBelong.map((belongItem, belongIndex) => (
                        <Draggable
                          draggableId={belongItem.id}
                          key={belongItem.id}
                          index={belongIndex}
                        >
                          {(provided) => (
                            <div                                          
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            >                           
                      <div className={!isNaN(belongItem.id) ? "words1" : (highlightedItems[belongItem.id] ? "words3" : "words2")}>
                        <h2>{belongItem.name}</h2>
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
             
            
          </div>
  
          <div className='belong__solution'>
            {sortedSolution.map((item, index) => (
              <div className={showSolution ? "belong__no__solution" : "words__solution"} key={item.id}>
                <h2>{item.name}</h2>
                {index < sortedSolution2.length && (
              <div className={showSolution ? "belong__no__solution2" : "words__solution"}>
                <h2>{sortedSolution2[index].name}</h2>
              </div>
            )}
              </div>
            ))}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
  
}


export default Belong