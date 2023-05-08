import {AppBar, Container, Avatar, Toolbar, Typography} from '@mui/material'
import { NavLink } from 'react-router-dom';
import './App.css';
const NavText = ({ href, text, isMain }) => {
    return (
        <Typography
            variant={isMain ? 'h5' : 'h7'}
            noWrap
            className="nav-text"
            style={{ flex: 1, fontFamily: "Nunito, sans-serif" }}
        >
            <NavLink
                to={href}
                className="nav-link"
            >
                {text}
            </NavLink>
        </Typography>
    )
}

export default function NavBar() {
    return (
        <AppBar position="static" style={{ width: '100%' }}>
                <Toolbar style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
                    <Container alignItems="center" justifyContent="space-between" style={{width: '90%',
                        maxWidth: '1200px', margin: '0 auto',}}>

                        <NavLink to="/HomePage">
                            <div className="logo-container">

                            <Avatar alt="Spotifinder" src="https://i.postimg.cc/qBjSP1Tt/favicon.png"
                                    style={{ marginRight: "10rem", height: "60px", width: "60px" }}/>
                            </div>
                        </NavLink>

                    <NavText href='/recomendPlaylist' text='Playlist Reccomender' />
                    <NavText href='/recomendSong' text='Song Reccomender' />
                    <NavText href='/playlists' text='Search Playlist' />
                    <NavText href='/search_artist' text='Search Artist' />
                    <NavText href='/search_album' text='Search Album' />
                    <NavText href='/aboutUs' text='About Us!' />
                    <NavText href='/' text='Logout' />
                    </Container>
                </Toolbar>
        </AppBar>
    );
}