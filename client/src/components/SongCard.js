import React, { useState, useEffect } from 'react';
import { Modal, Box, Button } from '@mui/material';
import axios from 'axios';

const SongCard = ({ trackName, artistName, albumName, handleClose }) => {
    // info for the videos
  const [videoId, setVideoId] = useState(null);
  const apiKey = 'REDACTED';
  const query = encodeURIComponent(`${trackName} ${artistName} ${albumName}`);

  useEffect(() => {
      //here we access the google api getting the video which most matches out artist name, album, and song (which 99 times
      // out of 100 is the right one)
    const fetchData = async () => {
      try {
        const response =
            await axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${query}&key=${apiKey}`);
        const items = response.data.items;
        if (items.length > 0) {
          setVideoId(items[0].id.videoId);
        }
      } catch (error) {
        console.error(error);
      }
    };
    // after we set the data then we play the song
    fetchData();
  }, [query, apiKey]);

  return (
      <Modal
          open={true}
          onClose={handleClose}
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <Box
            p={3}
            style={{
              background: 'white',
              borderRadius: '16px',
              border: '2px solid #000',
              width: 600,
            }}
        >
          <h1>{trackName}</h1>
          {videoId ? (
              <iframe
                  width="100%"
                  height="315"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={trackName}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
              ></iframe>
          ) : (
              <p>Loading...</p>
          )}
          <Button onClick={handleClose} style={{ left: '50%', transform: 'translateX(-50%)' }}>
            Close
          </Button>
        </Box>
      </Modal>
  );
};

export default SongCard;
