import React, { useEffect, useState } from 'react';
import defaultProfilePic from './images/defaultProfilePic.jpg';
import './user.css';
import {useParams, Link} from 'react-router-dom';

const User = () => {
    const { id } = useParams();
  const [playlists, setPlaylists] = useState([]);
  const [user, setUser] = useState(null);



const fetchUser = async () => {
    
    try {
      const response = await fetch(`http://localhost:2000/users/${id}`, {
    });
      if (!response.ok)  {
      console.error(`HTTP error! status: ${response.status}`);
      setUser(null);
      return;
      }
      const data = await response.json();
      setUser(data);
    } catch (err) {
      console.error('FetchPlaylists error:', err);
    }
  };

const fetchPlaylists = async () => {
        if (user && user.id) {
    try {
      const response = await fetch(`http://localhost:2000/playlists/user/${user.id}`, {
    });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      setPlaylists(data);
    } catch (err) {
      console.error('FetchPlaylists error:', err);
    }
  }
  };

 useEffect(() => {
        if (id) {
            fetchUser();
        }
    }, [id]);


    useEffect(() => {
        if (user) { 
            fetchPlaylists();
        }
    }, [user]); 


     if (!user) {
        return <div>Loading user data...</div>;
    }
  return (
    <div className="user-details">
      <img
        src={user.profilepic || defaultProfilePic}
        alt={user.username}
        className="user-pfp"
      />

     <div className="username-div">
 
    <div className="name-display">
      <span className="user-username">{user.username}</span>

    </div>
  
</div>


    <section className="home-content-section">
        <h2 className="home-section-title">{user.username}'s Playlists</h2>
        <div className="home-grid">
          {playlists.map(playlist => (
            <div key={playlist.id} className="home-card">
                  <Link to={`/playlist/${playlist.id}`}>
                         <img src={playlist.cover} alt={playlist.name} className="home-cover" />

              
            </Link>
              <div className="home-card-info">
                <div className="home-title-text">{playlist.name}</div>
                <div className="home-subtitle-text">
</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    
    </div>
  );
};

export default User;
