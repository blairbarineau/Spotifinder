import { useEffect, useState } from 'react';
import { Button, Container, Grid, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Link as RouterLink } from 'react-router-dom';
import './App.css';


const config = require('../config.json');

export default function ArtistPage() {
    const [pageSize, setPageSize] = useState(10);
    const [data, setData] = useState([]);
    const [artist_name, setArtistName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // query our DB to find similar artists. We first just start with all artists so the user can see it works
    // then we update with user input in the second fetch
    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/search_artist`)
            .then(res => res.json())
            .then(resJson => {
                const artistsWithName = resJson.map((name) => ({ id: name.artist_name, ...name }));
                setData(artistsWithName);
            });
    }, []);

    const search = () => {
        fetch(`http://${config.server_host}:${config.server_port}/search_artist?artist_name=${artist_name}`
        )
            .then(res => res.json())
            .then(resJson => {
                if (Array.isArray(resJson)) {
                    const artistsWithName = resJson.map((name) => ({ id: name.artist_name, ...name }));
                    setData(artistsWithName);
                    //need to set error messagae so the user can know when there is a mistake
                    if (artistsWithName.length === 0) {
                        setErrorMessage(`Sorry, there are no artists with that name.`);
                    } else {
                        setErrorMessage('');
                    }
                } else {
                    setErrorMessage(`Sorry, there are no artists with that name.`);
                }

            });


    }
    //we set the colums to be displayed
    const columns = [
        { field: 'artist_name', headerName: 'Artist Name', width: 300, color : "white",

            renderCell: (params) => (
                <RouterLink style = {{color: "white"}} to={`/artist/${params.value}`}>
                    {params.value}</RouterLink>),}
    ]

    return (
        <Container style={{ marginBottom: '50px' }}>
            <h2>Search Artists</h2>
            <Grid container spacing={6}>
                <Grid item xs={8}>
                    <TextField  label='Artist Name' value={artist_name} onChange={(e) => setArtistName(e.target.value)} style={{ width: "100%" }}/>
                </Grid>
            </Grid>
            <Button onClick={() => search() } style={{color: "white", left: '50%', transform: 'translateX(-50%)' }}>
                Search
            </Button>
            {errorMessage && <p>{errorMessage}</p>}
            <h2>Artist Results</h2>
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