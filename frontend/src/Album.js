import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './playlists.css';  
import defaultCover from './images/default_cover.png';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';




const Album = () => {
    const {name} = useParams();
  const [songs, setSongs] = useState([]);
  const [album , setAlbum] =useState('');

const navigate = useNavigate();

  
 useEffect(() => {


const fetchSongs = async () => {

  try {
    const response = await fetch(`http://localhost:2000/songs/album/${name}`, {
    });

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
    setAlbum(data[0]?.album)
  

  } catch (err) {
    console.error('FetchSongs error:', err);


  }
};
fetchSongs();
  }, [name]);


const fixedDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  let result = '';
  if (seconds == null) result = '';
  if (minutes > 0) result += `${minutes}m `;
  if (remainingSeconds > 0) result += `${remainingSeconds}s`;

  return result.trim();
};



    return (
  <div>
    <div className="playlist-header">
      <div className="playlist-header-row">
        <div className="cover-container">
          <img
            src={songs[0]?.cover || defaultCover}
            alt={songs[0]?.name || 'Album Cover'}
            className="playlistpage-playlist-cover"
            
          />
          
        </div>
      <h3 className="albumpage-name">{album}</h3>

      </div>
    </div>

    <ul>
      {songs.map((song,index) => (
        <li key={song.id} className="playlistpage-song-item">
          <div className="playlistpage-song-details">
                    <span className="song-number">{index + 1}. </span>
            <Link to={`/songs/${song.id}`} className="song-link">
              <span className="song-title">{song.title}</span>
            </Link>{" "}
            by <span className="song-artist">{song.artist}</span>{" "}
            <span className="playlistpage-song-duration">
              {fixedDuration(song.duration)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  </div>
);
};
export default Album;