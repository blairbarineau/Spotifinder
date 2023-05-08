import React from 'react';
import {Container} from '@mui/material';
import AlbumSlider from '../components/AlbumSlider';
import ArtistSlider from '../components/ArtistSlider';
//pretty simple just displaying the sliders in a container for better ux
export const HomePage = () => {
    return (
        <div style={{ marginBottom: '50px', textAlign: 'center' }}>
            <h2 style={{ color : 'darkgray'}}>Welcome to Spotifinder!</h2>
            <Container>
            <h3>Album's You Will find!</h3>
                <div  className="auth-form-container">
                    <AlbumSlider />
                </div>
            </Container>
            <Container>
            <h3>Artist's You Will Find!</h3>
                <div  className="auth-form-container">
                <ArtistSlider />
                    </div>
            </Container>

        </div>
    );
};
