import { useState } from 'react';
import { Button, Container, Grid, Slider, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Link as RouterLink } from 'react-router-dom';
import './App.css';

const config = require('../config.json');

export default function PlaylistRecommendPage() {
    const [pageSize, setPageSize] = useState(10);
    const [playlistArtist, setPlaylistArtist] = useState([]);
    const [playlistAlbum, setPlaylistAlbum] = useState([]);
    const [playlistValues, setPlaylistValues] = useState([]);


    const [artist_name, setArtistName] = useState('');
    const [album_name, setAlbumName] = useState('');


    const [avg_danceability, setDanceability] = useState(0);
    const [avg_energy, setEnergy] = useState(0);
    const [avg_tempo, setTempo] = useState(0);

    const [errorMessage, setErrorMessage] = useState('');
    const [errorMessage2, setErrorMessage2] = useState('');
    const [errorMessage3, setErrorMessage3] = useState('');

    //first we fetch the DB for the reccomendation for the artist name
    const search_artist = () => {
        fetch(`http://${config.server_host}:${config.server_port}/recommendPlaylist/${artist_name}`
        )
            .then(res => res.json())
            .then(resJson => {
                if (Array.isArray(resJson)) {
                    const playlistWithID = resJson.map((playlist) => ({ id: playlist.pid, ...playlist }));
                    setPlaylistArtist(playlistWithID);
                    //again we set these error messages so the user knows when there is an error
                    if (playlistWithID.length === 0) {

                        setErrorMessage(`Sorry, there are no playlists that match your search`);

                    } else {

                        setErrorMessage('');
                    }
                } else {

                    setErrorMessage(`Sorry, there are no playlists that match your search`);
                }
            });
    }
    // then we fetch to reccomend a playlist from fn album to set accordingly
    const search_album = () => {
        fetch(`http://${config.server_host}:${config.server_port}/recommendPlaylistAlbum/${album_name}`
        )
            .then(res => res.json())
            .then(resJson => {

                if (Array.isArray(resJson)) {

                    const playlistWithID = resJson.map((playlist) => ({ id: playlist.pid, ...playlist }));
                    setPlaylistAlbum(playlistWithID);

                    if (playlistWithID.length === 0) {
                        setErrorMessage2(`Sorry, there are no playlists that match your search`);
                    } else {
                        setErrorMessage2('');
                    }
                } else {
                    setErrorMessage2(`Sorry, there are no playlists that match your search`);
                }
            });
    }
    // we then look for the values input
    const search_values = () => {
        fetch(`http://${config.server_host}:${config.server_port}/recommendPlaylistInput/${avg_danceability}/${avg_energy}/${avg_tempo}`
        )
            .then(res => res.json())
            .then(resJson => {
                if (Array.isArray(resJson)) {
                    const playlistWithID = resJson.map((playlist) => ({ id: playlist.pid, ...playlist }));
                    setPlaylistValues(playlistWithID);
                    if (playlistWithID.length === 0) {
                        setErrorMessage3(`Sorry, there are no playlists that match your search`);
                    } else {
                        setErrorMessage3('');
                    }
                } else {
                    setErrorMessage3(`Sorry, there are no playlists that match your search`);
                }
            });
    }

    const columns = [
        { field: 'name', headerName: 'Playlist Name', width: 300,

            renderCell: (params) => (
                <RouterLink style={{color:'#333'}} to={`/playlist/${params.row.pid}`}>
                    {params.value}</RouterLink>),},

        { field: 'num_followers', headerName: 'Number of Followers', width: 300, },

        { field: 'num_artists', headerName: 'Number of Artists', width: 300, },

        { field: 'num_tracks', headerName: 'Number of Tracks', width: 300, },

        { field: 'duration_ms', headerName: 'Duration', width: 300, }

    ]


    return (
        <Container>
            <h1 style={{color:'white'}}>Playlist Recommendations!</h1>
            <Container>
                <h3>Who is your favorite artist?</h3>
                <Grid container spacing={6}>
                    <Grid item xs={8}>
                        <TextField label='Artist Name' value={artist_name} onChange={(e) => setArtistName(e.target.value)} style={{ width: "100%" }}/>
                    </Grid>
                </Grid>
                <Button onClick={() => search_artist() } style={{ color : 'white', left: '50%', transform: 'translateX(-50%)' }}>
                    Go!
                </Button>
                {errorMessage && <p>{errorMessage}</p>}
                <h3>Here are your top 10 playlist recommendations based on the vibe of your favorite artist!</h3>
                <DataGrid
                    rows={playlistArtist}
                    columns={columns}
                    pageSize={pageSize}
                    rowsPerPageOptions={[5, 10, 25]}
                    onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                    autoHeight
                />
            </Container>

            <Container>
                <h3>What is your favorite album?</h3>
                <Grid container spacing={6}>
                    <Grid item xs={8}>
                        <TextField label='Album Name' value={album_name} onChange={(e) => setAlbumName(e.target.value)} style={{ width: "100%" }}/>
                    </Grid>
                </Grid>
                <Button onClick={() => search_album() } style={{ color: 'white', left: '50%', transform: 'translateX(-50%)' }}>
                    Go!
                </Button>
                {errorMessage2 && <p>{errorMessage2}</p>}
                <h3>Here are your top 10 playlist recommendations based on your favorite album!</h3>
                <DataGrid
                    rows={playlistAlbum}
                    columns={columns}
                    pageSize={pageSize}
                    rowsPerPageOptions={[5, 10, 25]}
                    onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                    autoHeight
                />
            </Container>

            <Container style={{ marginBottom: '50px' }}>
                <h3>Input Your Preference!</h3>

                <Grid container spacing={6}>
                    <Grid item xs={4}>
                        <p>Danceability</p>
                        <Slider style={{color:'white'}}

                            value={avg_danceability}
                            step={.1}
                            marks
                            min={0}
                            max={1}
                            onChange={(e, newValue) => setDanceability(newValue)}
                            valueLabelDisplay='auto'
                        />
                    </Grid>

                    <Grid item xs={4}>
                        <p>Energy</p>
                        <Slider style={{color:'white'}}
                            value={avg_energy}
                            marks
                            min={0}
                            max={1}
                            step={.1}
                            onChange={(e, newValue) => setEnergy(newValue)}
                            valueLabelDisplay='auto'
                        />
                    </Grid>

                    <Grid item xs={4}>
                        <p>Tempo</p>
                        <Slider style={{color:'white'}}

                            value={avg_tempo}
                            marks
                            min={0}
                            max={1}
                            step={.1}
                            onChange={(e, newValue) => setTempo(newValue)}
                            valueLabelDisplay='auto'
                        />
                    </Grid>

                </Grid>

                <Button onClick={() => search_values() } style={{ left: '50%', transform: 'translateX(-50%)' }}>
                    Search </Button>
                {errorMessage3 && <p>{errorMessage3}</p>}
                <h3>Results</h3>
                <DataGrid
                    rows={playlistValues}
                    columns={columns}
                    pageSize={pageSize}
                    rowsPerPageOptions={[5, 10, 25]}
                    onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                    autoHeight
                />
            </Container>

        </Container>

    );

}