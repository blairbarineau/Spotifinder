import { useEffect, useState } from 'react';
import { Button, Container, Grid, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {Link as RouterLink} from 'react-router-dom';
import './App.css'
const config = require('../config.json');
export default function AlbumSearchPage() {
    const [data, setData] = useState([]);
    const [album_name, setTitle] = useState('');

    const [pageSize, setPageSize] = useState(10);
    const [errorMessage, setErrorMessage] = useState('');

    const [selectedAlbum, setSelectedAlbum] = useState(null);

    useEffect(() => {
        // first we return all of the albums so the user knows that the page is working
        fetch(`http://${config.server_host}:${config.server_port}/search_album`)
            .then(res => res.json())
            .then(resJson => {
                const albumWithName = resJson.map((album) => ({id: album.album_name, ...album}));
                setData(albumWithName);
            });
    }, []);
    // then based on user input we search for the desired title
    const search = () => {
        setData([]);
        fetch(`http://${config.server_host}:${config.server_port}/search_album?title=${album_name}`)
            .then(res => {
                return res.json();
            })
            .then(resJson => {
                //set the error messages accordingly
                if (Array.isArray(resJson)) {
                    const albumWithName = resJson.map((album) => ({id: album.album_name, ...album}));
                    setData(albumWithName);
                    // we also do this extra check so that if we return an empty array we display or if we dont return anything
                    if (albumWithName.length === 0) {
                        setErrorMessage(`Sorry, there are no albums with that name.`);
                    } else {
                        setErrorMessage('');
                    }
                } else {
                    setErrorMessage(`Sorry, there are no albums with that name.`);
                }
            });

    }
    //link to album info and columns
    const columns = [
        {field: 'album_name', headerName: 'Album Name', width: 200, renderCell: (params) =>
                (<RouterLink to={`/album/${params.value}/${params.row.artist_name}`}
                             style={{ color: 'white', textDecoration: 'none' }}>{params.value}
                </RouterLink>), cellClassName: 'white-font',},
        {field: 'artist_name', headerName: 'Artist Name',width: 200, cellClassName: 'white-font'},
        {field: 'num_songs', headerName: 'Number of Tracks', width: 200,cellClassName: 'white-font'},
        {field: 'avg_danceability', headerName: 'Danceability',  width: 200, cellClassName: 'white-font'},
        {field: 'avg_energy', headerName: 'Energy',  width: 200, cellClassName: 'white-font'},
        {field: 'avg_tempo', headerName: 'Tempo',  width: 200, cellClassName: 'white-font'},
    ];




    return (
        <Container style={{ marginBottom: '50px' }}>
            <h2>Search Albums</h2>
            <Grid container spacing={6}>
                <Grid item xs={8}>
                    <TextField
                        label='Album Title'
                        value={album_name}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{width: "100%"}}
                    />
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