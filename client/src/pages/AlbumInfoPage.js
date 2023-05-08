import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import './App.css';
import { Box, Grid, Typography } from '@mui/material';
import {Link as RouterLink} from 'react-router-dom';
import SongCard from '../components/SongCard';


const config = require('../config.json');

export default function AlbumInfoPage() {
    const [songData, setSongData] = useState([{}]);
    const [albumData, setAlbumData] = useState({}); // Change this line
    const [selectedSongId, setSelectedSongId] = useState(null);
    const [albumCover, setAlbumCover] = useState('');

    const {album_name, artist_name} = useParams();
    // we first get the album pictures for the top of the screen using a method similar to artist info
    useEffect(() => {
        const fetchData = async () => {
            const tokenResponse = await fetch(`https://accounts.spotify.com/api/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${btoa('REDACTED:REDACTED')}`
                },
                body: 'grant_type=client_credentials'
            });
            //get the token
            const tokenData = await tokenResponse.json();
            const token = tokenData.access_token;
            //find the album covers
            const albumResponse = await fetch(`https://api.spotify.com/v1/search?q=album:${encodeURIComponent(album_name)}%20artist:${encodeURIComponent(artist_name)}&type=album&limit=1`, {
                headers: {'Authorization': `Bearer ${token}`}
            });

            const albumCoverData = await albumResponse.json();
            if (albumCoverData.albums.items.length > 0) {
                setAlbumCover(albumCoverData.albums.items[0].images[0].url);
            }
        };
        // then we get the general album info like song and name
        fetch(`http://${config.server_host}:${config.server_port}/album_info/${album_name}/${artist_name}`)
            .then(res => res.json())
            .then(resJson => {
                setAlbumData(resJson);
                fetchData();
            });
        //next we get the songs
        fetch(`http://${config.server_host}:${config.server_port}/album/${album_name}/${artist_name}`)
            .then((res) => res.json())
            .then((data) => {
                setSongData(data);
            });
    }, [album_name, artist_name]);

    return (
        <Container style={{ marginBottom: '50px' }}>
            <Grid container spacing={2} alignItems="center" style={{ marginTop: '20px' }}>
                <Grid item xs={3}>
                    <Box className="moving-line" borderRadius="5%" width={302} height={302} display="flex" justifyContent="center" alignItems="center">
                        {albumCover && (
                            <Box
                                component="img"
                                src={albumCover}
                                alt={`${albumData.album_name} album cover`}
                                width={300}
                                height={300}
                                borderRadius="5%"
                                boxShadow={1}
                            />
                        )}
                    </Box>
                </Grid>
                <Grid item xs={10}>
                    <Typography variant="h3" style={{ color: 'white' }}>{albumData.album_name}</Typography>
                    <Typography variant="h4" style={{ color: 'white' }}>
                        <RouterLink to={`/artist/${encodeURIComponent(albumData.artist_name)}`} style={{ textDecoration: 'none', color: 'white' }}>
                            {albumData.artist_name}
                        </RouterLink>
                    </Typography>
                </Grid>
            </Grid>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell style={{ color: 'white' }}>Title</TableCell>
                            <TableCell style={{ color: 'white' }}>Danceability</TableCell>
                            <TableCell style={{ color: 'white' }}>Energy</TableCell>
                            <TableCell style={{ color: 'white' }}>Tempo</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {songData.map((song) =>
                            <TableRow key={song.track_uri}>
                                <TableCell>
                                    <Link onClick={() => setSelectedSongId(song.track_uri)} style={{ color: 'white' }}>
                                        {song.track_name}
                                    </Link>
                                </TableCell>
                                <TableCell key='Danceability' style={{ color: 'white' }}>{song.danceability}</TableCell>
                                <TableCell key='Energy' style={{ color: 'white' }}>{song.energy}</TableCell>
                                <TableCell key='Tempo' style={{ color: 'white' }}>{song.tempo}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            {selectedSongId && (
                <SongCard
                    trackName={songData.find((song) => song.track_uri === selectedSongId).track_name}
                    artistName={albumData.artist_name}
                    albumName={albumData.album_name}
                    handleClose={() => setSelectedSongId(null)}
                />
            )}
        </Container>
    );
}