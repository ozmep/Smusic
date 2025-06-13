import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
} from 'react-router-dom';
import Home from './Home';
import Songs from './Songs';
import Playlists from './Playlists';
import Playlistpage from './Playlistpage';
import LogReg from './LogReg';
import './App.css';
import NotFound from "./NotFound";
import Songpage from './Songpage';
import Album from "./Album";
import User from './user';
import Me from './me';
import Artist from './Artist';
import defaultProfilePic from './images/defaultProfilePic.jpg';

function App() {
const [currentUser, setCurrentUser] = useState(null);
const [loadingUser, setLoadingUser] = useState(true);

  
useEffect(() => {
  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('http://localhost:2000/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) {
        setCurrentUser(null);
      } else {
        const data = await res.json();
        if (data && data.loggedIn) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      }
    } catch (err) {
      setCurrentUser(null);
    } finally {
      setLoadingUser(false); // important!
    }
  };

  fetchCurrentUser();
}, []);


  const handleLogout = async () => {
    try {
      await fetch('http://localhost:2000/logout', {
        method: 'POST',
        credentials: 'include' 
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setCurrentUser(null);
      window.location.reload();
    }
  };

return (
  <Router>
    {loadingUser ? (
      <div className="loading">Loading...</div>
    ) : (
      <>
        <header className="navbar">
          {currentUser && (
            <div className="nav-user-info">
              <Link to="/me">
                <img
                  src={currentUser.profilepic || defaultProfilePic}
                  alt={`${currentUser.username}'s avatar`}
                  className="nav-user-pic"
                />
                <span className="nav-link">{currentUser.username}</span>
              </Link>
            </div>
          )}

          <nav className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/songs" className="nav-link">Songs</Link>
            {currentUser ? (
              <>
                <Link to="/playlists" className="nav-link">Playlists</Link>
                <button onClick={handleLogout} className="nav-link">Logout</button>
              </>
            ) : (
              <Link to="/LogReg" className="nav-link">Login / Register</Link>
            )}
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Home user={currentUser} />} />
            <Route path="/LogReg" element={<LogReg setCurrentUser={setCurrentUser} />} />
            <Route path="/songs" element={<Songs />} />
            <Route path="/songs/:id" element={<Songpage />} />
            <Route path="/user/:id" element={<User />} />
            <Route
              path="/playlists"
              element={currentUser ? <Playlists /> : <LogReg setCurrentUser={setCurrentUser} />}
            />
            <Route
              path="/playlist/:id"
              element={currentUser ? <Playlistpage user={currentUser} setUser={setCurrentUser} /> : <LogReg setCurrentUser={setCurrentUser} />}
            />
            <Route path="/album/:name" element={<Album />} />
            <Route path="/artist/:name" element={<Artist />} />
            <Route
              path="/me"
              element={currentUser ? <Me user={currentUser} setUser={setCurrentUser} /> : <LogReg setCurrentUser={setCurrentUser} />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </>
    )}
  </Router>
);

}

export default App;
