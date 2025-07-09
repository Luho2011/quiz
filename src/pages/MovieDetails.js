import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Movies2 from '../movies2.json';
import './MovieDetails.css';

function MovieDetails() {
  const { id } = useParams();
  const movie = Movies2.find((m) => m.ids.toString() === id);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeButtons, setActiveButtons] = useState([]);

  const handleButtonClick = (item) => {
    setSelectedItem(item);
    if (!activeButtons.includes(item.id)) {
      setActiveButtons([...activeButtons, item.id]);
    }
  };

  return (
     <div className='movieDetails'>
      <div className='movieDetails__items'>
        {movie.items.map((item) => (
          <button
            key={item.id}
            className={`movieDetails__itemBtn ${item.audio1 || item.audio2 || item.audio3 ? 'movieDetails__itemBtnmp3' : ''} ${activeButtons.includes(item.id) ? 'active' : ''} ${item.id.endsWith('7') || item.id.endsWith('14')  ? 'movieDetails__itemBtnBg' : ''}`}
            onClick={() =>  handleButtonClick(item)}
          >
            {item.id.endsWith('7') || item.id.endsWith('14') ? null : <p></p>}
          </button>
        ))}
      </div>
      <div className='movieDetails__content'>
        {selectedItem && selectedItem.image && (
          <img src={selectedItem.image} alt={`img-${selectedItem.id}`} />
        )}
        {selectedItem && selectedItem.image2 && (
          <img src={selectedItem.image2} alt={`gif-${selectedItem.id}`} />
        )}
        {selectedItem && selectedItem.image3 && (
          <img src={selectedItem.image3} alt={`img3-${selectedItem.id}`} />
        )}
        {selectedItem && selectedItem.image4 && (
          <img src={selectedItem.image4} alt={`img4-${selectedItem.id}`} />
        )}
        {selectedItem && selectedItem.image5 && (
          <img src={selectedItem.image5} alt={`img5-${selectedItem.id}`} />
        )}
        
       {selectedItem && selectedItem.audio1 && (
          <audio controls>
            <source src={selectedItem.audio1} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        )}
        {selectedItem && selectedItem.audio2 && (
          <audio controls>
            <source src={selectedItem.audio2} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        )}
        {selectedItem && selectedItem.audio3 && (
          <audio controls>
            <source src={selectedItem.audio3} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        )}
        <div className='movieDetails__cover'>
          {selectedItem && selectedItem.cover && (
            <img src={selectedItem.cover} alt={`cover${selectedItem.id}`} />
          )}
        </div>
      </div>
    </div>
  )
}

export default MovieDetails