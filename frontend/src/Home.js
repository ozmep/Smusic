import React, { useEffect, useState } from 'react';
import { useNavigate , Link } from 'react-router-dom';

import moment from 'moment';
import './home.css';

const Home = ({ user }) => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    if (!user) return navigate('/LogReg');

    const loadPlaylists = async () => {
      try {
        const res = await fetch('http://localhost:2000/playlists/');
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        const newest = data.sort((a, b) => b.id - a.id).slice(0, 5);
        setPlaylists(newest);
      } catch (err) {
        console.error('Error loading playlists:', err);
      }
    };

    const loadSongs = async () => {
      try {
        const res = await fetch('http://localhost:2000/songs/');
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        const formatted = data
          .map(s => ({
            ...s,
            durationFormatted: moment.utc(s.duration * 1000).format('mm:ss'),
          }))
          .sort((a, b) => b.id - a.id)
          .slice(0, 5);
        setSongs(formatted);
      } catch (err) {
        console.error('Error loading songs:', err);
      }
    };

    loadPlaylists();
    loadSongs();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="home-container">
      <h1 className="home-title">Welcome back, {user.username} 🎵</h1>
      <p className="home-subtitle">Enjoy your songs .</p>

      <section className="home-content-section">
        <h2 className="home-section-title">🎧 Latest Songs</h2>
        <div className="home-grid">
          {songs.map(song => (
            <div key={song.id} className="home-card">
               <Link to={`/songs/${song.id}`} className="song-link">     <img src={song.cover} alt={song.title} className="home-cover" /></Link>
              <div className="home-card-info">
         <div className="home-title-text">{song.title}</div>
                <div className="home-subtitle-text">{song.artist}</div>
                <div className="home-duration">{song.durationFormatted}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="home-content-section">
        <h2 className="home-section-title">🔥 Newets Playlists</h2>
        <div className="home-grid">
          {playlists.map(playlist => (
            <div key={playlist.id} className="home-card">
                  <Link to={`/playlist/${playlist.id}`}>
                         <img src={playlist.cover} alt={playlist.name} className="home-cover" />

              
            </Link>
              <div className="home-card-info">
                <div className="home-title-text">{playlist.name}</div>
                <div className="home-subtitle-text">By user #{playlist.user_id}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
