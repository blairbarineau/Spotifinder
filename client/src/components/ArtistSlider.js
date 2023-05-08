import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import config from '../config.json';
import {Link as RouterLink} from 'react-router-dom';

export default function ArtistSlider() {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 5,
    };

    const [artists, setArtists] = useState([]);
    // go in here to the spotify api
    const fetchArtistImages = async (artistList) => {
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

        const artistSearchPromises = artistList.map(async (artist) => {
            const searchResponse = await fetch(
                `https://api.spotify.com/v1/search?q=${artist.artist_name}&type=artist&limit=1`,
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                },
            );
            const searchData = await searchResponse.json();
            return searchData.artists.items[0];
        });

        const artistData = await Promise.all(artistSearchPromises);
        setArtists(artistData);
    };
    // first we get our optimal marketing artists then get their pictures
    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/album_slider`)
            .then((res) => res.json())
            .then((resJson) => {
                fetchArtistImages(resJson);
            });
    }, []);
    return (
        <Slider {...settings}>
            {artists.map((artist) => (
                <div key={artist.id}>
                    <RouterLink to={`/artist/${encodeURIComponent(artist.name)}`} style={{ textDecoration: 'none', color: 'white' }}>
                        <img className="moving-line" src={artist.images[0]?.url} alt={artist.artist_name} width={190} height={190} />
                    </RouterLink>
                    <h4 style={{ color: '#333' }}>{artist.name}</h4>
                </div>
            ))}
        </Slider>
    );
}
