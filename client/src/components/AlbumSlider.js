import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
//the slider
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import config from '../config.json';
import {Link as RouterLink} from 'react-router-dom';

export default function AlbumSlider() {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 5,
    };

    const [albums, setAlbums] = useState([]);
// first we access the api using similar to artist info
    const fetchAlbumImages = async (albumList) => {
        const tokenResponse = await fetch(`https://accounts.spotify.com/api/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${btoa('REDACTED:REDACTED')}`,
            },
            body: 'grant_type=client_credentials',
        });

        const tokenData = await tokenResponse.json();
        const token = tokenData.access_token;
        // then we get the album covers we need
        const albumSearchPromises = albumList.map(async (album) => {
            const searchResponse = await fetch(
                `https://api.spotify.com/v1/search?q=album:${encodeURIComponent(album.album_name)}%20artist:${encodeURIComponent(
                    album.artist_name,
                )}&type=album&limit=1`,
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                },
            );
            const searchData = await searchResponse.json();
            return searchData.albums.items[0];
        });
        //set the data based on what we got from the API
        const albumData = await Promise.all(albumSearchPromises);
        setAlbums(albumData);
    };
    // we first find the albums based on optimal marketing then get the covers
    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/album_slider`)
            .then((res) => res.json())
            .then((resJson) => {
                fetchAlbumImages(resJson);
            });
    }, []);
    return (
        <Slider {...settings}>
            {albums.map((album) => (
                <div key={album.id}>
                    <RouterLink to={`/album/${album.name}/${album.artists[0].name}`} style={{ textDecoration: 'none', color: 'white' }}>
                    <img className="moving-line" src={album.images[0]?.url} alt={album.name} width={190} height={190} />
                        </RouterLink>
                    <h5  style={{ color: '#333' }}>{album.name}</h5>
                    <h6 style={{ color: '#333' }}>{album.artists[0].name}</h6>
                </div>
            ))}
        </Slider>
    );
}
