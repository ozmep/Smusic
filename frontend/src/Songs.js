import './songs.css';
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { useNavigate, Link  } from 'react-router-dom';


const Songs = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
  const [newsong, setNewSong] = useState({
    title: '',
    artist: '',
    album: '',
    duration: '',
    cover: '',
  });

  useEffect(() => {
    
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const response = await fetch('http://localhost:2000/songs/');
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
      const formattedSongs = data.map((song) => ({
        ...song,
        durationFormatted: moment
          .utc(song.duration * 1000)
          .format('mm:ss'),
      }));
      setSongs(formattedSongs);
      setLoading(false);
    } catch (err) {
      console.error('FetchSongs error:', err);
      setError(err);
      setLoading(false);
    }
  };
const handleAddClick = async () => {
  const durationinseconds =
    parseInt(newsong.minutes) * 60 + parseInt(newsong.seconds);

  try {
    const response = await fetch('http://localhost:2000/songs/add', {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({
        title: newsong.title,
        artist: newsong.artist,
        album: newsong.album,
        duration: durationinseconds,
        cover: newsong.cover,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to add song: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    setNewSong({ title: '', artist: '', album: '', duration: '', cover: '' });
    setShowAddForm(false);
    await fetchSongs();

  } catch (error) {
    console.error('Error adding song:', error);
  }
};
  const handleAddChange = (e) => {
    setNewSong({ ...newsong, [e.target.name]: e.target.value });
  };

  

  return (
    <div className="songs-container">
      <div className="app-container">
        <h1 className="songs-header">Songs List</h1>

        {loading && <p className="loading">Loading...</p>}
        {error && <p className="error">Error: {error.message}</p>}

        {!loading && !error && (
          <ul className="songs-song-list">
            {songs.map((song) => (
              <li key={song.id} className="song-item">
                <img
                  src={song.cover || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSzgk1mI_XO8j2zdw46YC7FftcItSNU0pisQ&s'}
                  alt={`${song.title} album`}
                  className="album-cover"
                />
                
                    <div className="songs-song-details">
                                 <Link to={`/songs/${song.id}`} className="song-link">  <span className="song-title">{song.title}</span>{' '} </Link>
                      <span style={{ fontSize: '20px' }}>by</span>{' '}
                           <Link to={`/artist/${encodeURIComponent(song.artist)}`} className="song-link">  <span className="song-artist">{song.artist}</span>{' '} </Link>                       <span className="song-duration">
                        ({song.durationFormatted})
                      </span>
       <Link to={`/album/${song.album}`} className="song-link"><span className="song-album">{song.album}</span></Link>                      
                    </div>
              
              
              </li>
            ))}
          </ul>
        )}

        {responseMessage && <p>{responseMessage}</p>}

        <div>
          {!showAddForm && (
            <button
              className="add-btn"
              onClick={() => setShowAddForm(true)}
            >
              Add Song
            </button>
          )}
          {showAddForm && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddClick();
              }}
              className="edit-form"
            >
              <input
                type="text"
                name="title"
                value={newsong.title}
                onChange={handleAddChange}
                className="edit-input"
                placeholder="Title"
                maxLength={255}
                required
              />
              <input
                type="text"
                name="artist"
                value={newsong.artist}
                onChange={handleAddChange}
                className="edit-input"
                placeholder="Artist"
                maxLength={255}
                required
              />
              <input
                type="text"
                name="album"
                value={newsong.album}
                onChange={handleAddChange}
                className="edit-input"
                placeholder="Album"
                maxLength={255}
                required
              />
              <input
                type="number"
                name="minutes"
                value={newsong.minutes}
                onChange={handleAddChange}
                className="edit-input"
                placeholder="Minutes"
             min="0"
              />
              <input
                type="number"
                name="seconds"
                value={newsong.seconds}
                onChange={handleAddChange}
                className="edit-input"
                placeholder="Seconds"
                required
                min="0"
                 
              />
              <input
                type="text"
                name="cover"
                value={newsong.cover}
                onChange={handleAddChange}
                className="edit-input"
                placeholder="Cover Link"
              />
                <button type="buttpn" className="song-cancel-btn" onClick={() => setShowAddForm(false)} >
                Cancel
              </button>
              <button type="submit" className="song-submit-btn" >
                Submit
              </button>
              
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Songs;
