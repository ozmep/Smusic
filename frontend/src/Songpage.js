import React, { useState, useEffect } from 'react';
import './songs.css';  
import { Link, useParams, useNavigate  } from 'react-router-dom';
import moment from 'moment';

const Songspage = () => {
    const navigate = useNavigate();
        const {id} = useParams();
        const [song, setSong] = useState();
          const [editingId, setEditingId] = useState(null);
          const [editedSong, setEditedSong] = useState({});
            const [showAddForm, setShowAddForm] = useState(false);
            const [newsong, setNewSong] = useState({
              title: '',
              artist: '',
              album: '',
              duration: '',
              cover: '',
            });
          
useEffect(() => {
  
    fetchSong();
    
  }, []);

  const fetchSong = async () => {
    try {
      const response = await fetch(`http://localhost:2000/songs/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
   const formatted = moment.utc(data.duration * 1000).format('mm:ss');
      setSong({
  ...data,
  durationFormatted: formatted
});
    
    } catch (err) {
      console.error('FetchSong error:', err);
    }
  };


  const handleDelete = (id) => {
      const confirm = window.confirm("Are you sure you want to delete this song?");
  if (confirm) {
    fetch(`http://localhost:2000/songs/delete/${id}`, { method: 'DELETE' })
      .then((res) => res.json())
      .then(() => {
navigate(-1);
      });
    }
  };

  const handleEditClick = (song) => {
    setEditingId(song.id);
    setEditedSong({
      title: song.title,
      artist: song.artist,
      album: song.album,
      durationMin: Math.floor(song.duration / 60),
      durationSec: song.duration % 60,
      cover: song.cover,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedSong({ ...editedSong, [name]: value });
  };



 const handleAddClick = () => {
    const durationinseconds =
      parseInt(newsong.minutes) * 60 + parseInt(newsong.seconds);

    fetch('http://localhost:2000/songs/add', {
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
    setNewSong({ title: '', artist: '', album: '', duration: '', cover: '' });
    setShowAddForm(false);
    setTimeout(() => {
      fetchSong();
    }, 10);
  };

  const handleAddChange = (e) => {
    setNewSong({ ...newsong, [e.target.name]: e.target.value });
  };

  const handleSave = async (id) => {
     const updates = {};

  if (editedSong.title) {
    updates.title = editedSong.title;
  }
  if (editedSong.artist) {
    updates.artist = editedSong.artist;
  }
  if (editedSong.album) {
    updates.album = editedSong.album;
  }
  if (editedSong.cover) {
    updates.cover = editedSong.cover;
  }
  if (editedSong.durationMin || editedSong.durationSec) {
    const min = parseInt(editedSong.durationMin) || 0;
    const sec = parseInt(editedSong.durationSec) || 0;
    updates.duration = min * 60 + sec;
  }
 try {
    const res = await fetch(`http://localhost:2000/songs/update/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Update failed :(");
    }

    console.log("Update workedddddd:", data);
    setEditingId(null);
    fetchSong();
  } catch (error) {
    console.error("Error updating song:", error);
  }
};






  if (!song) return <div>Loading...</div>;
  return(
   
       <div className="songs-song-details">
          <img
    src={song.cover }
    alt={song.title}
    className="songpage-cover"
  />
                      <span className="song-page-title">{song.title}</span>
                     <div> <span style={{ fontSize: '20px' }}>by</span>
                      <span className="song-page-artist">{song.artist}</span>
                      <span className="song-page-duration">
                        ({song.durationFormatted})
                      </span>
                        <Link to={`/album/${song.album}`} className="song-link"><span className="song-page-album"> {song.album}</span></Link> 
                    </div>





                    {editingId === song.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSave(song.id);
                    }}
                    className="edit-form"
                  >
                    <input
                      type="text"
                      name="title"
                      value={editedSong.title}
                      onChange={handleEditChange}
                      className="songpage-input"
                      placeholder="Title"
                    />
                    <input
                      type="text"
                      name="artist"
                      value={editedSong.artist}
                      onChange={handleEditChange}
                      className="songpage-input"
                      placeholder="Artist"
                    />
                    <input
                      type="text"
                      name="album"
                      value={editedSong.album}
                      onChange={handleEditChange}
                      className="songpage-input"
                      placeholder="Album"
                    />
                    <div className="duration-inputs">
                      <input
                        type="number"
                        name="durationMin"
                        value={editedSong.durationMin}
                        onChange={handleEditChange}
                        placeholder="Min"
                        required
                      />
                      <input
                        type="number"
                        name="durationSec"
                        value={editedSong.durationSec}
                        onChange={handleEditChange}
                        placeholder="Sec"
                        required
                      />
                    </div>
                    <input
                      type="text"
                      name="cover"
                      value={editedSong.cover}
                      onChange={handleEditChange}
                      className="songpage-input"
                      placeholder="Cover Link"
                    />
                    <div className="actions-songpage">
                    <button type="submit" className="songpage-submit-btn">
                      Save
                    </button>
                    <button
                      type="button"
                      className="songpage-cancel-btn"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                    </div>
                  </form>
                ) : (
                  <>

                    <div className="song-actions">
                      <button
                        className="songpage-edit"
                        onClick={() => handleEditClick(song)}
                      >
                        Edit
                      </button>
                      <button
                        className="songpage-delete"
                        onClick={() => handleDelete(song.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
                    </div>

                    
  );
}

export default Songspage;

