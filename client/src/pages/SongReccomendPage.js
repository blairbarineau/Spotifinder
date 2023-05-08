import { useState } from 'react';
import { Button, Container, Grid, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Link as RouterLink } from 'react-router-dom';
import './App.css';
import SongCard from '../components/SongCard';

const config = require('../config.json');

export default function SongRecommendPage() {
    const [pageSize, setPageSize] = useState(10);
    const [data, setData] = useState([]);
    const [data2, setData2] = useState([]);
    const [selectedSongId, setSelectedSongId] = useState(null);
    const [artist_name, setArtistName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [errorMessage2, setErrorMessage2] = useState('');
    const [track_name, setSongName] = useState('');


    const search_artist = () => {
        fetch(`http://${config.server_host}:${config.server_port}/recommendSong?artist_name=${artist_name}`
        )
            .then(res => res.json())
            .then(resJson => {
                //need to see for error and set the error message accordingly
                if (Array.isArray(resJson)) {
                    const songsWithID = resJson.map((song) => ({ id: song.track_uri, ...song }));
                    setData(songsWithID);

                    if (songsWithID.length === 0) {
                        setErrorMessage(`Sorry, there are no songs that match your search`);
                    } else {
                        setErrorMessage('');
                    }
                } else {
                    setErrorMessage(`Sorry, there are no songs that match your search`);
                }
            });
    }
    //now we run the route to reccomend a track
    const search_track = () => {
        fetch(`http://${config.server_host}:${config.server_port}/recommendSongs/${track_name}`
        )
            .then(res => res.json())
            .then(resJson => {

                if (Array.isArray(resJson)) {
                    const songsWithIDs = resJson.map((songs) => ({ id: songs.track_uri, ...songs }));
                    setData2(songsWithIDs);

                    if (songsWithIDs.length === 0) {
                        setErrorMessage2(`Sorry, there are no songs that match your search`);
                    } else {
                        setErrorMessage2('');
                    }
                } else {
                    setErrorMessage2(`Sorry, there are no songs that match your search`);

                }
            });
    }
    // and we set the columns to be displayed
    const columns = [
        { field: 'track_name', headerName: 'Song Name', color : 'white', width: 300,  cellClassName: 'white-font',},

        { field: 'album_name', headerName: 'Album', width: 300, renderCell: (data) =>
                (<RouterLink to={`/album/${data.row.album_name}/${data.row.artist_name}`}
                             style={{ color: 'white', textDecoration: 'none' }}>{data.value}
                </RouterLink>), cellClassName: 'white-font',},

        { field: 'artist_name', headerName: 'Artist', width: 300, renderCell: (data) =>
                (<RouterLink to={`/artist/${data.row.artist_name}`}
                             style={{ color: 'white', textDecoration: 'none' }}>{data.value}
                </RouterLink>), cellClassName: 'white-font',}
    ]

    return (
        <Container style={{ marginBottom: '50px' }}>
            <h1>Song Recommendations!</h1>
            <Container>
                <h3>Who is your favorite artist?</h3>
                <Grid container spacing={6}>
                    <Grid item xs={8}>
                        <TextField label='Artist Name' value={artist_name} onChange={(e) => setArtistName(e.target.value)} style={{ width: "100%" }}/>
                    </Grid>
                </Grid>
                <Button onClick={() => search_artist() } style={{ left: '50%', transform: 'translateX(-50%)' }}>
                    Go!
                </Button>
                {errorMessage && <p>{errorMessage}</p>}
                <h3>Here are your top 5 song recommendations based on your favorite artist!</h3>
                <DataGrid style = {{color:'white'}}
                    rows={data}
                    columns={columns}
                    pageSize={pageSize}
                    rowsPerPageOptions={[5, 10, 25]}
                    onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                    autoHeight
                    onCellClick={(params, event) => {
                        if (params.field === 'track_name') {
                            setSelectedSongId(params.row.track_uri);
                        }
                    }}
                />
            </Container>

            <Container>
                <h3>What is your favorite song?</h3>
                <Grid container spacing={6}>
                    <Grid item xs={8}>
                        <TextField label='Song Name' value={track_name} onChange={(e) => setSongName(e.target.value)} style={{ width: "100%" }}/>
                    </Grid>
                </Grid>
                <Button onClick={() => search_track() } style={{ left: '50%', transform: 'translateX(-50%)' }}>
                    Go!
                </Button>
                {errorMessage2 && <p>{errorMessage2}</p>}
                <h3>Here are your top 5 song recommendations based on your favorite song!</h3>
                <DataGrid style = {{color:'white'}}
                    rows={data2}
                    columns={columns}
                    pageSize={pageSize}
                    rowsPerPageOptions={[5, 10, 25]}
                    onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                    autoHeight
                    onCellClick={(params, event) => {
                        if (params.field === 'track_name') {
                            setSelectedSongId(params.row.track_uri);
                        }
                    }}
                />
            </Container>
            {selectedSongId && (
                <SongCard
                    trackName={(data.find((song) => song.track_uri === selectedSongId) || data2.find((song) => song.track_uri === selectedSongId)).track_name}
                    artistName={(data.find((song) => song.track_uri === selectedSongId) || data2.find((song) => song.track_uri === selectedSongId)).artist_name}
                    albumName={(data.find((song) => song.track_uri === selectedSongId) || data2.find((song) => song.track_uri === selectedSongId)).album_name}
                    handleClose={() => setSelectedSongId(null)}
                />
            )}

        </Container>

    );

}