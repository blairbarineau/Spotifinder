import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import './index.css';

import NavBar from './components/NavBar';
//home & base pages
import AboutUsPage from './pages/AboutUsPage'
import {LoginPage} from './pages/LoginPage';
import CreateUserPage from './pages/CreateUserPage';
import {HomePage} from './pages/HomePage';
//info pages
import AlbumInfoPage from './pages/AlbumInfoPage';
import ArtistInfoPage from './pages/ArtistInfoPage';
import PlaylistsInfoPage from './pages/PlaylistsInfoPage';
//reccomendation pages
import PlaylistRecomendPage from './pages/PlaylistRecomendPage';
import SongRecomendPage from './pages/SongReccomendPage';
//search pages
import PlaylistSearchPage from './pages/PlaylistSearchPage';
import ArtistSearchPage from './pages/ArtistSearchPage';
import AlbumSearchPage from './pages/AlbumSearchPage';
import AccountCreatedPage from "./pages/AccountCreatedPage";

export default function App() {
  return (
      <BrowserRouter>
        <NavBar />
        <Routes>

          <Route path="/" element={<LoginPage />} />
          <Route path="/createUser" element={<CreateUserPage />} />
          <Route path="/HomePage" element={<HomePage />} />

          <Route path="/album/:album_name/:artist_name" element={<AlbumInfoPage />} />
          <Route path="/playlist/:pid" element={<PlaylistsInfoPage />} />

          <Route path="/recomendPlaylist" element={<PlaylistRecomendPage />} />
          <Route path="/recomendSong" element={<SongRecomendPage />} />

          <Route path="/playlists" element={<PlaylistSearchPage />} />
          <Route path="/search_artist" element={<ArtistSearchPage />} />
          <Route path="/search_album" element={<AlbumSearchPage />} />
            <Route path="/artist/:artist_name" element={<ArtistInfoPage/>} />
            <Route path="/AccountCreatedPage" element={<AccountCreatedPage />} />

          <Route path="/aboutUs" element={<AboutUsPage />} />
        </Routes>
      </BrowserRouter>

  );
}