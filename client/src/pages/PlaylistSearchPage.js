import { useEffect, useState } from 'react';
import { Button, Container, Grid, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Link as RouterLink } from 'react-router-dom';

import './App.css';


const config = require('../config.json');

export default function PlaylistSearchPage() {
    const [pageSize, setPageSize] = useState(10);
    const [data, setData] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    const [name, setName] = useState('');

    // we fetch based on the user input search for the playlist. Start with all so the user knows its working then fetch
    // based on the user input
    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/search_playlist`)
            .then(res => res.json())
            .then(resJson => {
                const playlistsWithID = resJson.map((playlist) => ({ id: playlist.pid, ...playlist }));
                setData(playlistsWithID);
            });
    }, []);

    const search = () => {
        fetch(`http://${config.server_host}:${config.server_port}/search_playlist?name=${name}`
        )
            .then(res => res.json())
            .then(resJson => {
                if (Array.isArray(resJson)) {
                    const playlistsWithID = resJson.map((playlist) => ({id: playlist.pid, ...playlist}));
                    setData(playlistsWithID);
                    if (playlistsWithID.length === 0) {
                        setErrorMessage(`Sorry, there are no playlists with that name.`);
                    } else {
                        setErrorMessage('');
                    }
                } else {
                    setErrorMessage(`Sorry, there are no playlists with that name.`);
                }
            });
    }

    const columns = [
        { field: 'name', headerName: 'Playlist Name', width: 300,

            renderCell: (params) => (
                <RouterLink style = {{color: "white"}} to={`/playlist/${params.row.pid}`}>
                    {params.value}</RouterLink>),},

        { field: 'num_followers', headerName: 'Number of Followers', width: 300, color: "white",},

        { field: 'num_artists', headerName: 'Number of Artists', width: 300, color: "white",},

        { field: 'num_tracks', headerName: 'Number of Tracks', width: 300, color: "white",},

        { field: 'duration_ms', headerName: 'Duration', width: 300, color: "white",}

    ]

    return (
        <Container style={{ marginBottom: '50px' }}>
            <h2>Search Playlists</h2>
            <Grid container spacing={6}>
                <Grid item xs={8}>
                    <TextField label='Playlist Name' value={name}
                               onChange={(e) => setName(e.target.value)} style={{ width: "100%" }}/>
                </Grid>
            </Grid>
            <Button onClick={() => search() } style={{ color: "white", left: '50%', transform: 'translateX(-50%)' }}>
                Search
            </Button>
            {errorMessage && <p>{errorMessage}</p>}
            <h2>Results</h2>
            <DataGrid style = {{color: "white"}}
                rows={data}
                columns={columns}
                pageSize={pageSize}
                rowsPerPageOptions={[5, 10, 25]}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                autoHeight
            />
        </Container>
    );

}