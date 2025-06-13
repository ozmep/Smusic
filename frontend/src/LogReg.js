import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LogReg.css';
import defaultCover from './images/default_cover.png';

const LogReg = ({ setCurrentUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState({
    username: '',
    password: '',
    email: '',
    profilepic: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const data = isLogin
      ? { username: user.username, password: user.password }
      : {
          username: user.username,
          password: user.password,
          email: user.email,
          profilepic: user.profilepic.trim() || defaultCover
        };

    const url = isLogin
      ? 'http://localhost:2000/login'
      : 'http://localhost:2000/register';


    try {
      const res = await fetch(url, {
        method: 'POST',
          credentials: 'include', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();

      if (isLogin) {
        if (res.status === 200) {
          const meRes = await fetch('http://localhost:2000/me', {
  credentials: 'include',
});
const meData = await meRes.json();
if (meData.loggedIn) {
  setCurrentUser(meData.user);
  navigate('/');
} else {
  setErrorMessage('Failed to fetch user data after login');
}
        } else {
          setErrorMessage(result.message || 'Invalid username or password');
        }
      } else {
        if (res.ok) {
          setSuccessMessage('Registration successful!');
          setIsLogin(true);
          setUser({ username: '', password: '', email: '', profilepic: '' });
        } else {
          setErrorMessage(result.message || 'Error during registration.');
        }
      }
    } catch {
      setErrorMessage(
        isLogin
          ? 'Error logging in! Please try again.'
          : 'Error during registration. Please try again.'
      );
    }
  };

  return (
    <div className="logreg-container">
      {errorMessage && (
        <div className="logreg-error-message" role="alert">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="logreg-success-message" role="status">
          {successMessage}
        </div>
      )}

      <h2 className="logreg-container__title">
        {isLogin ? 'Login' : 'Register'}
      </h2>

      <form onSubmit={handleSubmit}>
        <input
          className="logreg-input"
          type="text"
          name="username"
          placeholder="Username"
          value={user.username}
          onChange={handleChange}
          required
        />

        {!isLogin && (
          <input
            className="logreg-input"
            type="email"
            name="email"
            placeholder="Email"
            value={user.email}
            onChange={handleChange}
            required
          />
        )}

      <input
  className="logreg-input"
  type="password"
  name="password"
  placeholder="Password"
  value={user.password}
  onChange={handleChange}
  required
  // pattern="(?=.*[A-Z]).{8,}"
  // title="Must be 8 characters long and include at least one uppercase letter."
/>


        {!isLogin && (
          <input
            className="logreg-input"
            type="url"
            name="profilepic"
            placeholder="Profile Picture URL (optional)"
            value={user.profilepic}
            onChange={handleChange}
          />
        )}

        <button className="logreg-submit-btn" type="submit">
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>

      <div className="logreg-switch-text">
        {isLogin ? "Don't have an account?" : 'Already have an account?'}
        <button
          className="logreg-switch-btn"
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setErrorMessage('');
            setSuccessMessage('');
            setUser({ username: '', password: '', email: '', profilepic: '' });
          }}
        >
          {isLogin ? 'Register' : 'Login'}
        </button>
      </div>
    </div>
  );
};

export default LogReg;
