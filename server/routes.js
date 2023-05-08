const mysql = require('mysql')
const config = require('./config.json')

const connection = mysql.createConnection({
    host: config.rds_host,
    user: config.rds_user,
    password: config.rds_password,
    port: config.rds_port,
    database: config.rds_db
});
connection.connect((err) => err && console.log(err));

//This route finds the average dancebility from an artist and finds playlists which best match the dancebility
// of that artist. Essentially we are finding playlists which best match the vibe of an artist
const playlist_from_artist_vibe = async function(req, res) {

    const artist_name = req.params.artist_name;

    connection.query(`
    SELECT pid, name, num_followers, num_artists, num_tracks
    FROM Playlists
    ORDER BY ABS (avg_danceability - (SELECT DISTINCT avg_danceability
    FROM Artists
    WHERE artist_name = '${artist_name}'))
    LIMIT 10
  `, (err, data) => {
        if (err || data.length === 0) {
            console.log(err);
            res.json({});
        } else {
            res.json(data);
            console.log(data);
        }
    });

}


//This route displays playlists which contain the most songs from a user inputed artist
const playlists_with_artists = async function(req, res) {

    const artistName = req.params.artist_name;

    connection.query(`
        SELECT plays.pid, plays.name, COUNT(*) as numSongs, plays.num_tracks, plays.num_followers
        FROM (Contains contain JOIN Songs song ON contain.Song_ID = song.track_uri)
        JOIN Playlists plays on contain.playlist_id = plays.pid
        WHERE song.artist_name = '${artistName}'
        GROUP BY plays.pid
        ORDER BY numSongs DESC
        LIMIT 5
  `, (err, data) => {
        if (err || data.length === 0) {
            console.log(err);
            res.json({});
        } else {
            res.json(data);
        }
    });
}

//This displays and finds playlists with the most number of songs from an album
//This route helps users find playlists which are an extension of an album essentially
const playlist_album = async function(req, res) {

    const albumName = req.params.album_name;

    connection.query(`
        SELECT plays.pid, plays.name, plays.num_followers, plays.num_artists, plays.num_tracks, COUNT(*) as numSongs
        FROM (Contains contain JOIN Songs song ON contain.Song_ID = song.track_uri)
        JOIN Playlists plays on contain.playlist_id = plays.pid
        WHERE song.album_name = '${albumName}'
        GROUP BY plays.pid
        ORDER BY numSongs DESC
        LIMIT 10
  `, (err, data) => {
        if (err || data.length === 0) {
            console.log(err);
            res.json({});
        } else {
            res.json(data);
        }
    });
}
//this route recommends a song based on a user inputted artist based on the average dancebility proximity
const song_artist_rec = async function(req, res) {

    const artistName = req.query.artist_name ?? '';
    
    connection.query(`
    WITH cte_artists AS (
        SELECT DISTINCT artist_name, avg_danceability, avg_energy, avg_valence
        FROM Artists
        WHERE artist_name = '${artistName}'),
    
        cte_songs AS (
        SELECT DISTINCT track_name, artist_name, danceability, energy, valence, album_name, track_uri
        FROM Songs s
        WHERE artist_name <> '${artistName}')
    
        SELECT DISTINCT s.track_name, s.album_name, s.artist_name, s.track_uri
        FROM cte_songs s, cte_artists a
        ORDER BY ABS((danceability - avg_danceability)
        + (energy - avg_energy) + (valence - avg_valence))
        LIMIT 5
  `, (err, data) => {
        if (err || data.length === 0) {
            console.log(err);
            res.json({});
        } else {
            res.json(data);
        }
    });
}

// This route displays the info on a song used for the song card
const song = async function(req, res) {

    const track_uri = req.params.track_uri;

    connection.query(`
      SELECT track_name, album_name, artist_name
      FROM Songs
      WHERE track_uri = ${track_uri}
  `, (err, data) => {
        if (err || data.length === 0) {
            console.log(err);
            res.json({});
        } else {
            res.json(data);
        }
    });
}

// This route displays the info of a playlist with all of the songs used for the playlist info page
const playlist_song = async function(req, res) {

    const pid = req.params.pid;
    connection.query(`
        SELECT S.track_name, S.album_name, S.track_uri, S.artist_name
        FROM Contains c JOIN Songs S on c.Song_ID = S.track_uri
        WHERE Playlist_ID = ${pid}
        `, (err, data) => {
        if (err || data.length === 0) {
            res.json({});
        } else {
            res.json(data);
        }
    });

}
//displays everyone in the group for the about us page
const people = async function(req, res) {
    connection.query(`
      SELECT*
      FROM People
  `, (err, data) => {
        if (err || data.length === 0) {
            console.log(err);
            res.json({});
        } else {
            const peopleData = data.map(person => ({
                name: person.name,
                major: person.major,
                year: person.year,
                url: person.url,
                artist_name: person.artist_name

            }));
            res.json(peopleData);
            console.log(peopleData);
        }
    });
}
//displays all of the songs on an album given the artist and the artist name since they are both keys
const albums_songs = async function(req, res) {
    const album_name = req.params.album_name;
    const artist_name = req.params.artist_name;

    connection.query(`
    SELECT track_name, danceability, energy, tempo
    FROM Songs
    WHERE album_name = ? AND artist_name = ?
  `, [album_name, artist_name], (err, data) => {
        if (err || data.length === 0) {
            console.log(err);
            res.json({});
        } else {
            res.json(data);
        }
    });
}
// checks if the user login is valid for the login page
const login = async (req, res) => {
    const username = req.params.username;
    const password = req.params.password;

    if (username && password) {
        connection.query(
            'SELECT * FROM userInfo WHERE username = ? AND password = ?',
            [username, password],
            function(err, data) {
                if (err) {
                    console.error(err);
                    res.status(500).send('Internal Server Error');
                    return;
                }

                if (data.length > 0) {
                    res.send('success');
                } else {
                    res.send('failure');
                }
            }
        );
    } else {
        res.status(400).send('Please enter username and password');
    }
}
//finds albums based on user input for the albums search page
const find_albums = async function(req, res) {
    const title = req.query.title ?? '';
    connection.query(`
        SELECT album_name, artist_name, num_songs, avg_danceability, avg_energy, avg_tempo
        FROM Albums
        WHERE album_name LIKE '%${title}%'
        ORDER BY album_name ASC;
    `, (err, data) => { // Use a parameterized query
        if (err || data.length === 0) {
            console.log(err);
            res.json({});
        } else {
            res.json(data);
        }
    });

}
//displays all of the information for a album so that we return the right songs for the output
const album_info = async function(req, res) {
    const albumName = req.params.album_name;
    const artistName = req.params.artist_name;

    connection.query(`
      SELECT album_name, artist_name
      FROM Albums
      WHERE album_name LIKE '${albumName}%' AND artist_name LIKE '${artistName}%'
    `, (err, data) => {
        if (err || data.length === 0) {
            console.log(err);
            res.json({});
        } else {
            res.json(data[0]);
        }
    });
}
//used for the artist search page to find the names of the artist
const search_artist = async function(req, res) {

    const name = req.query.artist_name ?? '';
    connection.query(
        `
      SELECT DISTINCT artist_name 
      FROM Artists
      WHERE artist_name LIKE '${name}%'
      ORDER BY artist_name
    `, (err, data) => {
            if (err || data.length === 0) {

                res.json({});
            } else {
                res.json(data);
            }
        });
}
//used to create a user without copying another username
const create_user = async function(req, res) {

    const username = req.params.username;
    const password = req.params.password;

    connection.query(
        `INSERT INTO userInfo (username, password) VALUES ("${username}", "${password}")`,
        (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send({ success: false, message: 'Error creating user' });
            } else {
                res.status(201).send({ success: true });
            }
        }
    )
}
//finds all the artists an artist has for the artist info page
const artist_albums = async function(req, res) {
    const page = req.query.page;
    const page_size = req.query.page_size ?? 5
    if (!page) {
        connection.query(`
    SELECT DISTINCT al.album_name FROM Albums al
    INNER JOIN Artists ar ON ar.artist_name = al.artist_name
    WHERE ar.artist_name = '${req.params.artist_name}'
    LIMIT 5
    `, (err, data) => {
            if (err || data.length === 0) {
                res.json({});
            } else {
                res.json(data);
                console.log(data);
            }
        });

    } else {
        connection.query(`
    SELECT DISTINCT al.album_name FROM Albums al
    INNER JOIN Artists ar ON ar.artist_name = al.artist_name
    WHERE ar.artist_name = '${req.params.artist_name}'
    LIMIT ${page_size} 
    OFFSET ${(page-1)*(page_size)}
    `, (err, data) => {
            if (err || data.length === 0) {
                res.json({});
                console.log("You have issues")
            } else {
                res.json(data);
            }
        });

    }

}
//used for playlist search to find playlists like the user inputted name
const search_playlist = async function(req, res) {

    const name = req.query.name ?? '';
    console.log(name);

    connection.query(
        `
     SELECT DISTINCT pid, name, num_followers, num_artists, num_tracks
     FROM Playlists
     WHERE name LIKE '${name}%'
     ORDER BY num_followers DESC, duration_ms DESC, name ASC
   `, (err, data) => {
            if (err || data.length === 0) {
                console.log(err);
                res.json({});
            } else {
                // console.log(data);
                res.json(data);
            }
        });
}
//gets the name and the number of followers to display at the top of the playlist info page
const playlist = async function(req, res) {
    const pid = req.params.pid;

    connection.query(`
        SELECT DISTINCT name, num_followers, collaborative
        FROM Playlists
        WHERE pid = ${pid}
        `, (err, data) => {
        if (err || data.length === 0) {
            res.json({});
        } else {
            res.json(data[0]);
        }
    });

}

// Recommends songs based on the user inputted song
const song_song_rec = async function(req, res) {
   
    const songName = req.params.track_name ?? '';

    connection.query(`
    with cte_song AS (
        SELECT danceability, energy, valence
        from Songs
        WHERE track_name = '${songName}'
        )
        SELECT distinct track_name, artist_name, track_uri, album_name
        from Songs song, cte_song
        where track_name <> '${songName}'
        ORDER BY ABS ((song.danceability - cte_song.danceability)
        + (song.energy - cte_song.energy)
        + (song.valence - cte_song.valence)) DESC
        LIMIT 5`, 
        (err, data) => {
            if (err || data.length === 0) {
                console.log(err);
                res.json({});
            } else {
                res.json(data);
            }
        });
}
//recommends playlists by the dancebilility, tempo, and energy
const playlists_by_danceability = async function(req, res) {

    //base values based on the averages for each attribute
    const danceability = req.params.avg_danceability ?? 0.61;
    const tempo = req.params.avg_tempo ?? 120.54;
    const energy = req.params.avg_energy ?? .5;

    connection.query(`
    SELECT pid, name, num_followers, num_artists, num_tracks
    FROM Playlists
    ORDER BY (ABS (avg_danceability - ${danceability})+ ABS (avg_tempo - ${tempo}) + ABS (avg_energy - ${energy}))
    LIMIT 10
    
  `, (err, data) => {
        if (err || data.length === 0) {
            console.log(err);
            res.json({});
        } else {
            res.json(data);
        }
    });
}
//gets the featured artists for slide, my inputs for maximum marketing potential
const artist_slider = async function(req,res){
    connection.query(`
        SELECT DISTINCT artist_name 
        FROM Artists 
        WHERE artist_name = 'Kanye West' 
                OR artist_name = 'Taylor Swift' 
                OR artist_name = 'Kid Cudi' 
                OR  artist_name = 'Kendrick Lamar' 
                OR artist_name = 'Metallica' 
                OR artist_name = 'Madonna' 
                OR artist_name = 'The Beatles' 
                OR artist_name = 'Rufus Du Sol'
        `, (err, data) => {
        if (err || data.length === 0) {
            console.log(err);
            res.json({});
        } else {
            res.json(data);
        }
    });
}
//gets the featured albums for slide, my inputs for maximum marketing potential

const album_slider = async function(req,res){
    connection.query(`
        SELECT DISTINCT artist_name, album_name
        From Albums
        WHERE (album_name = 'Graduation' AND artist_name = 'Kanye West') OR
      (artist_name = 'Taylor Swift' AND album_name = '1989') OR
      (artist_name = 'J. Cole' AND album_name = '2014 Forest Hills Drive') OR
      (album_name = 'DAMN.' AND artist_name = 'Kendrick Lamar') OR
      (album_name = 'The Blueprint' AND artist_name = 'JAY Z') OR
      (album_name = 'Define' AND artist_name = 'Dom Dolla') OR
      (album_name = 'The Money Store' AND artist_name = 'Death Grips') OR
      (album_name = 'SATURATION' and artist_name = 'Brockhampton')
        `, (err, data) => {
        if (err || data.length === 0) {
            console.log(err);
            res.json({});
        } else {
            res.json(data);
        }
    });
}

module.exports = {
    //artist search
    search_artist,

    //about us
    people,

    //album search
    find_albums,

    //album_info
    albums_songs,
    album_info,

    //login
    login,

    //create user
    create_user,

    //artist info
    artist_albums,
    playlists_with_artists,

    //search playlist
    search_playlist,

    //playlist info
    playlist,
    playlist_song,

    //song card
    song,

    //song reccomendation
    song_artist_rec,
    song_song_rec,

    //playlist reccomendation
    playlist_from_artist_vibe,
    playlist_album,
    playlists_by_danceability,

    //sliders
    artist_slider,
    album_slider

}
