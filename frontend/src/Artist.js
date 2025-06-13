import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './playlists.css';  
import defaultCover from './images/default_cover.png';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';




const Artist = () => {
    const {name} = useParams();
  const [songs, setSongs] = useState([]);
  const [artist , setArtist] =useState('');

const navigate = useNavigate();

  
 useEffect(() => {


const fetchSongs = async () => {

  try {
    const response = await fetch(`http://localhost:2000/songs/artist/${name}`, {
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
    setArtist(data[0]?.artist)
  

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

      <h3 className="albumpage-name">{artist}</h3>

      </div>
    </div>

    <ul>
      {songs.map((song,index) => (
        <li key={song.id} className="playlistpage-song-item">
          <div className="playlistpage-song-details">
               
                    <span className="song-number">{index + 1}. </span>
                    <img
                    src={song.cover || defaultCover}
                    className="song-cover"
                  />
            <Link to={`/songs/${song.id}`} className="song-link">
              <span className="song-title">{song.title}</span>
            </Link>{" "}
            {" "}
         <Link to={`/album/${song.album}`} className="song-link">
             <span className="song-album">{song.album}</span>
             </Link>
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
export default Artist;