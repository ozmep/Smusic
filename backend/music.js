
const express = require('express');
const cors = require('cors');
const {Pool} = require("pg");
const bcrypt = require('bcrypt');
const app = express();
const saltRounds = 10;
const session = require('express-session');
app.use(express.json());
app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );


app.use(
  session({
    secret: "mySecretOz",
    resave: false,
    saveUninitialized: false,
    cookie:{
      httpOnly:true,
      secure:false,
      sameSite:"lax"
    }
  })
);


const port = 2000
const pool = new Pool({
    user:"postgres",
    host:"localhost",
    database:"postgres",
    password: "12345678",
    port: 5432,
});






//SONGS--
app.get("/songs", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM songs");
        res.json(result.rows);
    } catch (error) {
        console.error("Database query error:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/songs/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const result = await pool.query(`SELECT * FROM songs WHERE id = $1;`, [id]);

        if (result.rowCount > 0) {
            return res.status(200).json(result.rows[0]); // Return the song details
        } else {
            return res.status(404).json({ message: "Song not found" });
        }
    } catch (error) {
        console.error("Database query error:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


app.get("/songs/album/:title", async (req, res) => {
    const title = req.params.title;
    try {
        const result = await pool.query(`SELECT * FROM songs WHERE album = $1;`, [title]);

        if (result.rowCount > 0) {
            return res.status(200).json(result.rows); // Return the song details
        } else {
            return res.status(404).json({ message: "Song not found" });
        }
    } catch (error) {
        console.error("Database query error:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


app.post("/songs/add", async (req, res) => {
    const { title, artist, album, duration ,cover} = req.body;

    if (!title || !artist || !album || !duration) {
        return res.status(400).json({ message: "All fields are required." });
    }

    const client = await pool.connect(); // Start a transaction
    try {
        await client.query("BEGIN"); // Start transaction

        const result = await client.query(
            `INSERT INTO songs (title, artist, album, duration,cover) VALUES ($1, $2, $3, $4, $5) RETURNING id;`,
            [title, artist, album, duration,cover]
        );

        await client.query("COMMIT"); // Commit the transaction

        res.status(201).json({ message: "Song added successfully", id: result.rows[0].id });
    } catch (error) {
        await client.query("ROLLBACK"); 


        console.error("Database insert error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    } finally {
        client.release(); 
    }
});

app.delete("/songs/delete/:id", async (req, res) => {
    const id = req.params.id;
    console.log(id);
    try {
        const result = await pool.query(`DELETE FROM songs WHERE id = $1;`, [id]);
        if (result.rowCount > 0) {
            res.status(200).json({ message: "Song deleted successfully" });
        } else {
            res.status(400).json({ message: "Failed to delete song" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
//update 

app.patch("/songs/update/:id", async (req, res) => {
  const id = req.params.id;       
  const { title, artist, album, duration, cover } = req.body;  

  try {
    if (title) {
      await pool.query(
        "UPDATE songs SET title = $1 WHERE id = $2;",
        [title, id]
      );
    }
    if (artist) {
      await pool.query(
        "UPDATE songs SET artist = $1 WHERE id = $2;",
        [artist, id]
      );
    }
    if (album) {
      await pool.query(
        "UPDATE songs SET album = $1 WHERE id = $2;",
        [album, id]
      );
    }
    if (duration) {
      await pool.query(
        "UPDATE songs SET duration = $1 WHERE id = $2;",
        [duration, id]
      );
    }
    if (cover) {
      await pool.query(
        "UPDATE songs SET cover = $1 WHERE id = $2;",
        [cover, id]
      );
    }

    const result = await pool.query(
      "SELECT * FROM songs WHERE id = $1;",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Song not found" });
    }

    res.status(200).json({
      message: "Song updated successfully",
      song: result.rows[0]
    });

  } catch (error) {
    console.error("Error updating song:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//SONGS--


//USERS--

  app.post("/register", async(req,res) =>{
   const {username, password , email , profilepic} = req.body;
  try{
    const checkUser = await pool.query(`SELECT * FROM users WHERE username=$1`, [username]);
    if(checkUser.rows.length>0){
      return res.status(401).json({message: "שם משתמש תפוס"});
    }

    const checkEmail = await pool.query(`SELECT * FROM users WHERE email=$1`, [email]);
    if(checkUser.rows.length>0){
      return res.status(401).json({message: "מייל תפוס"});
    }
    const hashedPassword = await bcrypt.hash(password,10);
    const result = await pool.query(
      `INSERT INTO users (username,password, email , profilepic) VALUES ($1,$2 , $3 , $4) RETURNING *`,
      [username, hashedPassword , email , profilepic])
      const user = result.rows[0];
      if(result.rowCount>0){
        req.session.user = {id:user.id, username:user.username , profilepic:user.profilepic};
        res.status(201).json({message:"User register successfully", user});
      }
    }catch(error){
      console.log(error);
      res.status(500).json({message:"Internal Server Error"});
    }
  });
  


  
  app.post("/login", async(req,res) =>{
    const {username, password} = req.body;
    try{
      const result = await pool.query(`SELECT * FROM users WHERE username=$1`,[username]);
      if(result.rows.length == 0 ){
        return res.status(401).json({message:  "שם משתמש או סיסמא לא נכונים"})
      }
      const user = result.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if(!isMatch){
        return res.status(401).json({message: "שם משתמש או סיסמא לא נכונים"});
      }
      req.session.user = {id:user.id, username:user.username , profilepic:user.profilepic , email:user.email , createddate:user.createddate};
      res.json({message:"ההתחברות הצליחה", user});
    }catch(error){
      console.log(error);
      res.status(500).json({message: "Internal Server Error"});
    }
  });

  app.get("/me", (req,res) => {
    if(req.session.user){
      res.json({loggedIn:true, user:req.session.user});
    }else{
      res.status(401).json({loggedIn:false});
    }
  })

  app.post("/logout", (req,res)=>{
    req.session.destroy(() => {
      res.json({message: "Logged Out"});
    })
  })


app.post("/logout", (req,res)=>{
  req.session.destroy(()=>{
    res.json({message:"Logged Out"});
  })
})

app.get("/users", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM users");
        res.json(result.rows);
    } catch (error) {
        console.error("Database query error:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/users/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const result = await pool.query(`SELECT * FROM users WHERE id = $1;`, [id]);

        if (result.rowCount > 0) {
            return res.status(200).json(result.rows[0]); // Return the song details
        } else {
            return res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Database query error:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.delete("/users/delete/:id", async (req, res) => {
    const id = req.params.id;
    console.log(id);
    try {
        const result = await pool.query(`DELETE FROM users WHERE id = $1;`, [id]);
        if (result.rowCount > 0) {
            res.status(200).json({ message: "User deleted successfully" });
        } else {
            res.status(400).json({ message: "Failed to delete user" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.patch("/users/updateusername/", async (req, res) => {
 const id = req.session.user.id;
    const username = req.body.username;

    try {
        const existingUser = await pool.query(`SELECT * FROM users WHERE username = $1;`, [username]);

        if (existingUser.rowCount > 0) {
            return res.status(409).json({ message: "Username is already taken. Please choose a different one." });
        }

        const result = await pool.query(
            `UPDATE users SET username = $1 WHERE id = $2 RETURNING *;`,
            [username, id]
        );

        if (result.rowCount > 0) {
            req.session.user = result.rows[0];
            return res.status(200).json({
                message: "Username updated successfully.",
                user: result.rows[0]
            });
        } else {
            return res.status(404).json({ message: "User not found or no update was made." });
        }
    } catch (err) {
        console.error("Database update error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


app.patch("/users/updatepassword/:id", async (req, res) => {
    const id = req.params.id;
    const password = req.body.password;

    try {
        const result = await pool.query(
            `UPDATE users SET password = $1 WHERE id = $2 RETURNING *;`,
            [password, id]
        );

        if (result.rowCount > 0) {
            return res.status(200).json({
                message: "User's password updated successfully",
                user: result.rows[0]
            });
        } else {
            return res.status(404).json({ message: "User not found or no update was made." });
        }
    } catch (err) {
        console.error("Database update error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
//USERS --

//PLAYLISTS--
app.get("/playlists", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM playlists");
        res.json(result.rows);
    } catch (error) {
        console.error("Database query error:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


app.get("/playlists/my/", async (req, res) => {


  if (!req.session.user) {
    return res.status(401).json({ message: "Not logged in" });
  }

  try {
 const userId = req.session.user.id;

    const result = await pool.query(
      `SELECT * FROM playlists WHERE user_id = $1;`,
      [userId]
    );

    if (result.rowCount > 0) {
      return res.status(200).json(result.rows);
    } else {
      return res.status(404).json({ message: "User does not have any playlists" });
    }
  } catch (error) {
    console.error("Database query error:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


app.get("/playlists/user/:id", async (req, res) => {

  try {
    const userId = req.params.id;

    const result = await pool.query(
      `SELECT * FROM playlists WHERE user_id = $1;`,
      [userId]
    );

    if (result.rowCount > 0) {
      return res.status(200).json(result.rows);
    } else {
      return res.status(404).json({ message: "User does not have any playlists" });
    }
  } catch (error) {
    console.error("Database query error:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/playlists/:id", async (req, res) => {
    const id = req.params.id;
    try {
        // Fetch the playlist
        const playlistResult = await pool.query(`SELECT * FROM playlists WHERE id = $1;`, [id]);

        if (playlistResult.rowCount === 0) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        const playlist = playlistResult.rows[0];

        // If the playlist has no songs, return it with an empty song list
        if (playlist.song_ids.length === 0) {
            return res.status(200).json({ 
                id: playlist.id,
                user_id: playlist.user_id,
                name: playlist.name,
                songs: [],
                cover:playlist.cover
            });
        }

        // Fetch full song details
        const songResult = await pool.query(
            `SELECT id, title, artist, album, duration,cover FROM songs WHERE id = ANY($1);`,
            [playlist.song_ids]
        );

        res.status(200).json({
            id: playlist.id,
            user_id: playlist.user_id,
            name: playlist.name,
            cover:playlist.cover,
            songs: songResult.rows // Full song details
        });

    } catch (error) {
        console.error("Database query error:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});




app.post("/playlists/create", async (req, res) => {
    let { name , cover } = req.body;
const userId = req.session.user.id; 
    // If user is logged in, get user_id from session (or token, depending on your auth system)


    if (!userId || !name) {
        return res.status(400).json({ message: "Playlist name is required. If not logged in, user ID is also required." });
    }

    try {
        // Insert a new playlist with an empty song list
        const result = await pool.query(
            `INSERT INTO playlists (user_id, name, song_ids , cover) VALUES ($1, $2, $3 , $4) RETURNING *;`,
            [userId, name, [] , cover] // Empty array for song_ids
        );

        res.status(201).json({
            message: "Playlist created successfully",
            playlist: result.rows[0]
        });
    } catch (error) {
        console.error("Database insert error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


app.delete("/playlists/delete/:id", async (req, res) => {
    const id = req.params.id;
    console.log(id);
    try {
        const result = await pool.query(`DELETE FROM playlists WHERE id = $1;`, [id]);
        if (result.rowCount > 0) {
            res.status(200).json({ message: "Playlist deleted successfully" });
        } else {
            res.status(400).json({ message: "Failed to delete playlist" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.patch("/playlists/update/:id", async (req, res) => {
    const id = req.params.id;
    const playlist = req.body.playlist;

    try {
        if (playlist.name) {
            await pool.query(
                "UPDATE playlists SET name = $1 WHERE id = $2;",
                [playlist.name, id]
            );
        }

        if (playlist.cover) {
            await pool.query(
                "UPDATE playlists SET cover = $1 WHERE id = $2;",
                [playlist.cover, id]
            );
        }

        const result = await pool.query(
            "SELECT * FROM playlists WHERE id = $1;",
            [id]
        );

        if (result.rowCount > 0) {
            return res.status(200).json({
                message: "Playlist updated successfully",
                playlist: result.rows[0]
            });
        } else {
            return res.status(404).json({ message: "Playlist not found or no update was made." });
        }
    } catch (err) {
        console.error("Database update error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});





app.post("/playlists/add/:playlist_id", async (req, res) => {
    const playlist_id = req.params.playlist_id; // Playlist ID from URL
    const { song_id } = req.body; // Song ID from request body

    if (!song_id) {
        return res.status(400).json({ message: "Song ID is required." });
    }

    try {
        // Check if the song exists before adding it
        const songCheck = await pool.query(`SELECT id FROM songs WHERE id = $1;`, [song_id]);
        if (songCheck.rowCount === 0) {
            return res.status(404).json({ message: "Song not found." });
        }

        // Update playlist by appending the new song_id to song_ids array
        const result = await pool.query(
            `UPDATE playlists SET song_ids = array_append(song_ids, $1) WHERE id = $2 RETURNING *;`,
            [song_id, playlist_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Playlist not found." });
        }

                const updatedPlaylist = result.rows[0];
        const songResult = await pool.query(
            `SELECT id, title, artist, album, duration,cover FROM songs WHERE id = ANY($1);`,
            [updatedPlaylist.song_ids]
        );

        res.status(200).json({
            id: updatedPlaylist.id,
            user_id: updatedPlaylist.user_id,
            name: updatedPlaylist.name,
            cover:updatedPlaylist.cover,
            songs: songResult.rows //כל השירים
        });

        
    } catch (error) {
        console.error("Database update error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


app.delete("/playlists/remove/:playlist_id", async (req, res) => {
    const playlist_id = req.params.playlist_id; // Playlist ID from URL
    const { song_id } = req.body; // Song ID from request body

    if (!song_id) {
        return res.status(400).json({ message: "Song ID is required."  });
    }

    try {
        // Check if playlist exists
        const playlistResult = await pool.query(`SELECT * FROM playlists WHERE id = $1;`, [playlist_id]);
        if (playlistResult.rowCount === 0) {
            return res.status(404).json({ message: "Playlist not found." });
        }

        const playlist = playlistResult.rows[0];

        // Check if the song is in the playlist
        if (!playlist.song_ids.includes(song_id)) {
            return res.status(400).json({ message: "Song is not in the playlist." });
        }

        // Remove the song from the array
        const updatedSongIds = playlist.song_ids.filter(id => id !== song_id);

        // Update the playlist with the new song_ids array
        const updateResult = await pool.query(
            `UPDATE playlists SET song_ids = $1 WHERE id = $2 RETURNING *;`,
            [updatedSongIds, playlist_id]
        );

        res.status(200).json({
            message: "Song removed from playlist successfully",
            playlist: updateResult.rows[0]
        });

    } catch (err) {
        console.error("Database update error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

//PLAYLISTS--

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})