import React, { useState, useEffect } from 'react';
import './playlists.css';  
import { Link } from 'react-router-dom';
import defaultCover from './images/default_cover.png';
const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newplaylist, setNewPlaylist] = useState({
    name: '',
    cover: ''
  });

  const handleCreateChange = (e) => {
    setNewPlaylist({ ...newplaylist, [e.target.name]: e.target.value });
  };

const handleCreateClick = async () => {
  try {
    const response = await fetch('http://localhost:2000/playlists/create', {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        name: newplaylist.name,
        cover: newplaylist.cover
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to create playlist: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    setShowCreateForm(false);
    await fetchPlaylists();

  } catch (error) {
    console.error('Error creating playlist:', error);
  }
};

  const fetchPlaylists = async () => {
    
    try {
      const response = await fetch('http://localhost:2000/playlists/my/', {
      credentials: 'include' 
    });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      setPlaylists(data);
    } catch (err) {
      console.error('FetchPlaylists error:', err);
      setError('Failed to load playlists');
    }
  };

  useEffect(() => { fetchPlaylists(); }, []);

  return (
    <div className="playlist-container">
      <h2 className="playlist-title">Your Playlists</h2>
      {error && <p className="playlist-message">{error}</p>}

      <div className="playlists">
      
        {playlists.map((playlist) => (
          <div key={playlist.id} className="playlist card">
            <Link to={`/playlist/${playlist.id}`}>
              <img
                src={playlist.cover || defaultCover}
                alt={playlist.name}
                className="playlist-cover"
              />
              
            </Link>
            <h3 className="playlist-name">{playlist.name}</h3>
          </div>

          
        ))}
          {!showCreateForm ? (
          <button
            className="create-playlist-button"
            onClick={() => setShowCreateForm(true)}
          >
            <div className="create-playlist-icon">＋</div>
            <div className="create-playlist-text">Create a new playlist</div>
          </button>
        ) : (
          <form
            className="Create-Form"
            onSubmit={(e) => { e.preventDefault(); handleCreateClick(); }}
          >
            <input
              type="text"
              name="name"
              value={newplaylist.name}
              onChange={handleCreateChange}
              className="create-lines"
              placeholder="Name"
              maxLength={255}
              required
            />
            <input
              type="text"
              name="cover"
              value={newplaylist.cover}
              onChange={handleCreateChange}
              className="create-lines"
              placeholder="Cover Link (Optional)"
              
            />
             <button type="cancel" className="cancel-btn" onClick={() => setShowCreateForm(false)} >
                Cancel
              </button>
            <button type="submit" className="submit-playlist">Submit</button>
          </form>
        )}

      </div>

      
    </div>
  );
};

export default Playlists;
