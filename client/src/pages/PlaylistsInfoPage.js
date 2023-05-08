import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

import './App.css';
import SongCard from "../components/SongCard";
import { Box, Container, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

const config = require('../config.json');

export default function PlaylistInfoPage() {
    const { pid } = useParams();
    const [selectedSongId, setSelectedSongId] = useState(null);
    const [songData, setSongData] = useState([{}]);
    const [playlistData, setPlaylistData] = useState([]);
    const [topFourSongsInfo, setTopFourSongsInfo] = useState([]);

    // First we get all of the songs from a playlist to be displayed
    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/playlist_song/${pid}`)
            .then(res => res.json())
            .then(resJson => {
                setSongData(resJson);
                if (resJson && resJson.length > 0) {
                    //once we get the songs we need the top four album covers
                    fetchTopFourSongsInfo(resJson);
                }
            });
        // then we get the playlist information for the header
        fetch(`http://${config.server_host}:${config.server_port}/playlist/${pid}`)
            .then(res => res.json())
            .then(resJson => {
                setPlaylistData(resJson);

            });
    }, [pid]);
    //next we go to this function which finds the top four songs from the playlist for the spotify API to query and return
    //the album heads. Similarly done to album info and artist info
    const fetchTopFourSongsInfo = async (songs) => {
        const topSongs = songs.slice(0, 4);
        const tokenResponse = await fetch(`https://accounts.spotify.com/api/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${btoa('REDACTED:REDACTED')}`
            },
            body: 'grant_type=client_credentials'
        });

        const tokenData = await tokenResponse.json();
        const token = tokenData.access_token;

        //we then get the top four albums cover
        const topSongsInfoPromises = topSongs.map(async (song) => {
            const searchResponse =
                await fetch(
                    `https://api.spotify.com/v1/search?q=album:${encodeURIComponent(song.album_name)}%20artist:${encodeURIComponent(song.artist_name)}&type=album&limit=1`, {
                headers: {'Authorization': `Bearer ${token}`}
            });
            const searchData = await searchResponse.json();

            if (!searchData.albums || searchData.albums.items.length === 0) {
                return null;
            }
            const albumData = searchData.albums.items[0];
            //we return the data for the pictures
            return {
                albumName: albumData.name,
                albumCover: albumData.images[0].url,
                artistName: albumData.artists[0].name,
                artistId: albumData.artists[0].id
            };

        });
        // here we set the data so that it can be displayed
        const topSongsInfo = await Promise.all(topSongsInfoPromises);
        setTopFourSongsInfo(topSongsInfo);
    };


    return (
        <Container style={{ marginBottom: '50px' }}>
            <Stack direction="row" spacing={2} sx={{ marginTop: 2, marginBottom: 2 }}>
                {topFourSongsInfo.map((songInfo, index) => (
                    <Box className="moving-line" borderRadius="5%" key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img style={{ borderRadius: '5%' }} src={songInfo.albumCover} alt={songInfo.albumName} width="150" height="150" />
                    </Box>
                ))}
            </Stack>
            <h1 style = {{color: "white"}}> {playlistData.name}</h1>
            <h4 style = {{color: "darkgray"}}> {"Number of Followers: " + playlistData.num_followers} </h4>
            <h4 style = {{color: "darkgray"}}> {"Is Collaborative? : " + playlistData.collaborative}</h4>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell style = {{color: "white"}} key='Title'>Title</TableCell>
                            <TableCell style = {{color: "white"}} key='Artist'>Artist</TableCell>
                            <TableCell style = {{color: "white"}} key='Album'>Album</TableCell>
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
                                <TableCell style = {{color: "white"}} key='Artist'>
                                    <Link style = {{color: "white"}} to={`/artist/${song.artist_name}`}>{song.artist_name}</Link>
                                </TableCell>
                                <TableCell style = {{color: "white"}} key='Album'>
                                    <Link style = {{color: "white"}} to={`/album/${song.album_name}/${song.artist_name}`}>{song.album_name}</Link>
                                </TableCell>
                            </TableRow>
                        )}

                    </TableBody>
                </Table>
            </TableContainer>
            {selectedSongId && (
                <SongCard
                    trackName={songData.find((song) => song.track_uri === selectedSongId).track_name}
                    artistName={songData.find((song) => song.track_uri === selectedSongId).artist_name}
                    albumName={songData.find((song) => song.track_uri === selectedSongId).album_name}
                    handleClose={() => setSelectedSongId(null)}
                />
            )}
        </Container>
    );
}



