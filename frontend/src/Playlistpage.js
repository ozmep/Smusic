import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './playlists.css';  
import defaultCover from './images/default_cover.png';
import moment from 'moment';

const Playlistpage = ({ user, setUser }) => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState('');
  const navigate = useNavigate();
  const [editData, setEditData] = useState({ name: "", cover: "" });
  const [showCoverForm, setShowCoverForm] = useState(false);
  const [showNameForm, setShowNameForm] = useState(false);

  const handleNameClick = () => {
    setEditData({ ...editData, name: playlist.name });
    setShowNameForm(true);
  };

  const handleCoverClick = () => {
    setEditData({ ...editData, cover: playlist.cover });
    setShowCoverForm(true);
  };
const handleCoverSubmit = (e) => {
  e.preventDefault();
  const updatedPlaylist = { ...playlist, cover: editData.cover };
  fetch(`http://localhost:2000/playlists/update/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playlist: updatedPlaylist }) 
  });
  setShowCoverForm(false);
  setTimeout(fetchPlaylist, 30);
};


const handleNameSubmit = (e) => {
  e.preventDefault();
  const updatedPlaylist = { ...playlist, name: editData.name };
  fetch(`http://localhost:2000/playlists/update/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playlist: updatedPlaylist }) 
  });
  setShowNameForm(false);
  setTimeout(fetchPlaylist, 30);
};



  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this song?");
    if (confirm) {
      try {
        const response = await fetch(`http://localhost:2000/playlists/delete/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delte');
        navigate('/playlists/');
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const handleRemoveSong = async (songid) => {
    const confirm = window.confirm("Are you sure you want to delete this song?");
    if (confirm) {
      try {
        const response = await fetch(`http://localhost:2000/playlists/remove/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ song_id: songid })
        });
        if (!response.ok) throw new Error('Failed to delte');
      } catch (err) {
        console.error('Delete error:', err);
      }
      setTimeout(fetchPlaylist, 30);
    }
  };

  const fetchPlaylist = async () => {
    try {
      const response = await fetch(`http://localhost:2000/playlists/${id}`);
      const data = await response.json();
      setPlaylist(data);
    } catch (error) {
      console.error("Failed to fetch:", error);
    }
  };

  useEffect(() => {
    fetchPlaylist();
    const fetchSongs = async () => {
      try {
        const response = await fetch('http://localhost:2000/songs/');
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();
        const formattedSongs = data.map((song) => ({
          ...song,
          durationFormatted: moment.utc(song.duration * 1000).format('mm:ss'),
        }));
        setSongs(formattedSongs);
      } catch (err) {
        console.error('FetchSongs error:', err);
      }
    };
    fetchSongs();
  }, [id]);

  const fixedDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    let result = '';
    if (seconds == null) result = '';
    if (minutes > 0) result += `${minutes}m `;
    if (remainingSeconds > 0) result += `${remainingSeconds}s`;
    return result.trim();
  };

  const HandleAddSong = async () => {
    if (!selectedSongId) return;
    try {
      const response = await fetch(`http://localhost:2000/playlists/add/${id}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ song_id: selectedSongId })
      });
      const updated = await response.json();
      setPlaylist(updated);
      setShowAddForm(false);
      setSelectedSongId('');
    } catch (error) {
      console.error("Add song error:", error);
    }
  };

  const songsNotInPlaylist = songs.filter(
    (song) => !playlist?.songs.some((playlistsong) => playlistsong.id === song.id)
  );
  if (!playlist) return <p>Loading...</p>;
  if(playlist.user_id == user.id){
  return (
    
    <div className="playlist-header">
      <div>
        {playlist ? (
          <>
            <div className="playlist-header-row">
              <div className="cover-container">
                {showCoverForm ? (
                  <form onSubmit={handleCoverSubmit} className="cover-form">
                    <input
                      type="text"
                      placeholder="New cover URL"
                      value={editData.cover}
                      onChange={(e) => setEditData({ ...editData, cover: e.target.value })}
                      className="cover-url-input"
                    />
                    <button
                      type="button"
                      className="cover-cancel-button"
                      onClick={() => {
                        setShowCoverForm(false);
                        setEditData({ ...editData, cover: playlist.cover });
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="cover-submit-button">
                      Update Cover
                    </button>
                  </form>
                ) : (
                  <div>
                    <img
                      src={playlist.cover || defaultCover}
                      alt={playlist.name}
                      className="playlistpage-playlist-cover"
                    />
                    <img
                      src="https://static.thenounproject.com/png/5926334-200.png"
                      alt="Edit Cover"
                      className="edit-icon"
                      onClick={handleCoverClick}
                    />
                  </div>
                )}
              </div>

              <div className="name-container">
                {showNameForm ? (
                  <form onSubmit={handleNameSubmit} className="name-form">
                    <input
                      type="text"
                      placeholder="New Playlist Name"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="name-input"
                    />
                    <button
                      type="button"
                      className="cancel-name-button"
                      onClick={() => {
                        setShowNameForm(false);
                        setEditData({ ...editData, name: playlist.name });
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="submit-name-button">
                      Update Name
                    </button>
                  </form>
                ) : (
                  <div className="name-display">
                    <h1>{playlist.name}</h1>
                    <img
                      src="https://static.thenounproject.com/png/5926334-200.png"
                      alt="Edit Name"
                      className="edit-name-icon"
                      onClick={handleNameClick}
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              {!showAddForm && (
                <button onClick={() => setShowAddForm(true)} className="add-to-playlist-button">
                  + Add Song
                </button>
              )}
              {showAddForm && (
                <form onSubmit={(e) => { e.preventDefault(); HandleAddSong(); }}>
                  <select
                    value={selectedSongId}
                    onChange={(e) => setSelectedSongId(e.target.value)}
                    className="songselect"
                  >
                    <option value="">Select a song</option>
                    {songsNotInPlaylist.map((song) => (
                      <option key={song.id} value={song.id}>
                        {song.title} - {song.artist}
                      </option>
                    ))}
                  </select>
                  <div className="button-row">
                    <button type="submit" className="add-to-playlist-submit">Submit</button>
                    <button type="button" className="cancel-add-to-playlist-submit" onClick={() => setShowAddForm(false)}>Cancel</button>
                  </div>
                </form>
              )}
            </div>

            {playlist.songs.map((song) => (
              <li key={song.id} className="playlistpage-song-item">
                <div className="playlistpage-song-details">
                  <img
                    src={song.cover || defaultCover}
                    alt={playlist.name}
                    className="song-cover"
                  />
                  <Link to={`/songs/${song.id}`} className="song-link"><span className="song-title">{song.title}</span></Link> by{" "}
                  <span className="song-artist">{song.artist}</span>{" "}
                  <Link to={`/album/${song.album}`} className="song-link"><span className="song-album">{song.album}</span></Link>{" "}
                  <span className="playlistpage-song-duration">{fixedDuration(song.duration)}</span>
                </div>
                <button
                  className="remove-song"
                  onClick={() => handleRemoveSong(song.id)}
                >
                  Delete
                </button>
              </li>
            ))}

            <div className="delete-playlist-container">
              <button
                onClick={() => handleDelete(playlist.id)}
                className="delete-playlist"
              >
                Delete {playlist.name}
              </button>
            </div>
          </>
        ) : (
          <p>Loading .....</p>
        )}
      </div>
    </div>
  );
}
else
{

      return(
    <div className="playlist-header">
      <div>
        {playlist ? (
          <>
            <div className="playlist-header-row">
              <div className="cover-container">
   <div>
                    <img
                      src={playlist.cover || defaultCover}
                      alt={playlist.name}
                      className="playlistpage-playlist-cover"
                    />

                  </div>
              </div>

              <div className="name-container">
                
                  <div className="name-display">
                    <h1>{playlist.name}</h1>
    
                  </div>
                
              </div>
            </div>

           

            {playlist.songs.map((song) => (
              <li key={song.id} className="playlistpage-song-item">
                <div className="playlistpage-song-details">
                  <img
                    src={song.cover || defaultCover}
                    alt={playlist.name}
                    className="song-cover"
                  />
                  <Link to={`/songs/${song.id}`} className="song-link"><span className="song-title">{song.title}</span></Link> by{" "}
                  <span className="song-artist">{song.artist}</span>{" "}
                  <Link to={`/album/${song.album}`} className="song-link"><span className="song-album">{song.album}</span></Link>{" "}
                  <span className="playlistpage-song-duration">{fixedDuration(song.duration)}</span>
                </div>
      
              </li>
            ))}
          </>
        ) : (
          <p>Loading .....</p>
        )}
      </div>
    </div>
      )
}

};

export default Playlistpage;
