import { useEffect, useState } from 'react';
import {useParams} from 'react-router-dom';
import {Box, Container, Divider, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,} from '@mui/material';
import { NavLink } from 'react-router-dom';
import './App.css';
const config = require('../config.json');

const ArtistInfoPage = () => {
    const { artist_name } = useParams();
    const [albumData, setAlbumData] = useState([{}]);
    const [artistData, setArtistData] = useState([]);
    const [artistImage, setArtistImage] = useState('');
    const [playlistData, setPlaylistData] = useState([{}]);

    useEffect(() => {
        //first we need to get our spotify API key which must be fetched using Client ID and Client Secret
        const fetchData = async () => {
            const tokenResponse = await fetch(`https://accounts.spotify.com/api/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${btoa('REDACTED:REDACTED')}`
                },
                body: 'grant_type=client_credentials'
            });
            //we got the token so lets set it
            const tokenData = await tokenResponse.json();
            const token = tokenData.access_token;
            //now we need ot get the picture of the artist based on the input & set it
            const artistResponse =
                await fetch(`https://api.spotify.com/v1/search?q=${artist_name}&type=artist&limit=1`, {
                headers: {'Authorization': `Bearer ${token}`}});

            const artistData = await artistResponse.json();
            const artist_id = artistData.artists.items[0].id;

            setArtistImage(artistData.artists.items[0].images[0].url);
            //ok now we use our DB to get their albums and their playlits which feature them the most
            const albumResponse =
                await fetch(`http://${config.server_host}:${config.server_port}/artist_albums/${artist_name}`);
            const albumData = await albumResponse.json();

            fetch(`http://${config.server_host}:${config.server_port}/artist_playlists/${artist_name}`)
                .then(res => res.json())
                .then(resJson => {
                    setPlaylistData(resJson);
                });
            // In order to store the url and our information for the albums from our DB, we have to update the album Data
            const updatedAlbumData = await Promise.all(
                // So we take the result from the Spotify Api and set it to the image data
                albumData.map(async (album) => {
                    const albumImageResponse = await fetch(
                        `https://api.spotify.com/v1/search?q=album:${album.album_name}%20artist:${artist_name}&type=album&limit=1`,
                        {headers: { Authorization: `Bearer ${token}`,},});
                    const albumImageData = await albumImageResponse.json();
                    //then we get the url and the album name for
                    const albumImageUrl = albumImageData.albums.items[0]?.images[0]?.url || null;
                    return {name: album.album_name, album_image: albumImageUrl,};}));
            // so then we reset our album data with the correct URLs for the pictures, note we keep the spotify album name
            // because TBH I cannot figure out how to keep our own
            setAlbumData(updatedAlbumData);
            // For similar artists we just use the spotify API to get more accurate information than our query
            const similarArtistResponse = await fetch(`https://api.spotify.com/v1/artists/${artist_id}/related-artists`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const similarArtistData = await similarArtistResponse.json();

            setArtistData(similarArtistData.artists.map(artist => ({ ...artist, artist_image: artist.images[0]?.url })));
        }
        //error check for testing
        fetchData().catch(error => {
            console.error('Error fetching data from Spotify API', error);
        });

    }, [artist_name]);

    return (
        <Container style={{ marginBottom: '50px' }}>
            <Grid container direction="column" alignItems="center" spacing={2}>
                <Grid item>
                    <h2>{artist_name}</h2>
                </Grid>
                <Grid item>
                    <Box className="moving-line" width={302} height={302} display="flex"
                         justifyContent="center" alignItems="center" borderRadius="5%">
                        {artistImage && (
                            <img src={artistImage} alt={artist_name} width="300" height="300" style={{ borderRadius: '5%' }}/>
                        )}
                        <div className="line line-top"></div>
                        <div className="line line-right"></div>
                        <div className="line line-bottom"></div>
                        <div className="line line-left"></div>
                    </Box>
                </Grid>
            </Grid>
            <Divider />
            <h2>Artist Albums</h2>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>  </TableCell>
                            <TableCell style={{ color: 'white' }} >Album Name</TableCell>

                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {albumData.map((album, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    {album.album_image && <img src={album.album_image} alt={album.name} width="50" height="50" />}
                                </TableCell>
                                <TableCell>
                                <NavLink style={{ color: 'white' }} to={`/album/${album.name}/${artist_name}`}>{album.name}</NavLink>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Divider />
            <h2>Similar Artists</h2>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>   </TableCell>
                            <TableCell style={{ color: 'white' }}>Artist Name</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {artistData.slice(0, 5).map((artist, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    {artist.artist_image && <img src={artist.artist_image} alt={artist.name} width="50" height="50" />}
                                </TableCell >
                                <TableCell>
                                    <NavLink style={{ color: 'white' }} to={`/artist/${artist.name}`}>{artist.name}</NavLink>
                                </TableCell >
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                </TableContainer>
                <Divider />
            <h2>Playlists with {artist_name}</h2>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell style = {{color: "white"}}>Playlist Name </TableCell>
                            <TableCell style = {{color: "white"}}> Number of Songs</TableCell>
                            <TableCell style={{ color: 'white' }}> Number of Followers</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {playlistData.map((playlist, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <NavLink style = {{color: "white"}} to={`/playlist/${playlist.pid}`}>
                                        {playlist.name}</NavLink>
                                </TableCell>
                                <TableCell key='num_tracks' style={{ color: 'white' }}>{playlist.num_tracks}</TableCell>
                                <TableCell key='num_followers' style={{ color: 'white' }}>{playlist.num_followers}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Divider />
        </Container>
);

}

export default ArtistInfoPage