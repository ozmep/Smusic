import React, { useEffect, useState } from 'react';
import defaultProfilePic from './images/defaultProfilePic.jpg';
import './user.css';

const Me = ({ user, setUser }) => {
  
  const [newName, setNewName] = useState(user.username);
  const [showNameForm, setShowNameForm] = useState(false);


  const handleNameClick = () => {
    setNewName(user.username);
    setShowNameForm(true);
  };

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:2000/users/updateusername', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: newName }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.message || 'Update failed');
      return;
    }

    const data = await res.json();
    // **Update App.js state** with new user object:
    setUser(data.user);
    setShowNameForm(false);
  };





  return (
    <div className="user-details">
      <img
        src={user.profilepic || defaultProfilePic}
        alt={user.username}
        className="user-pfp"
      />

     <div className="username-div">
  {showNameForm ? (
          <form onSubmit={handleNameSubmit} className="name-form">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="name-input"
            />
            <button
              type="button"
              onClick={() => setShowNameForm(false)}
              className="cancel-name-button"
            >
              Cancel
            </button>
            <button type="submit" className="submit-name-button">
              Update Username
            </button>
          </form>
          ) : (
    <div className="name-display">
      <span className="user-username">{user.username}</span>
      <img
        src="https://static.thenounproject.com/png/5926334-200.png"
        alt="Edit Name"
        className="edit-name-icon"
        onClick={handleNameClick}
      />
    </div>
  )}
</div>

      <span className="user-more-details">ID: {user.id}</span>
      <span className="user-more-details">Email: {user.email || 'N/A'}</span>
    </div>
  );
};

export default Me;
