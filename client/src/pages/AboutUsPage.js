import { useEffect, useState } from 'react';
import { Box, Container, Typography } from '@mui/material';
import './App.css';
import {Link as RouterLink} from "react-router-dom";
const config = require('../config.json');

export default function AboutUs() {
    const [people, setPeople] = useState([]);
    // we first get everyone in the DB for the people
    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/aboutUs`)
            .then(res => res.json())
            .then(resJson => setPeople(resJson));
    }, []);
    //flex format so the sizes arent skewed
    const flexFormat =
        {display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly'};

    return (
        <Container style={{ ...flexFormat, fontFamily: 'Tajawal, sans-serif' }}>
            {people.map((person) =>
                <Box className="moving-line"
                     key={person.name}
                     p={3}
                     m={2}
                     style={{
                         background: '#A3D7B5D1',
                         borderRadius: '16px',
                         border: '2px solid #000',
                         width: '300px',
                         height: '400px',
                         display: 'flex',
                         flexDirection: 'column',
                         justifyContent: 'center',
                         alignItems: 'center',
                     }}
                >
                    <img
                        src={person.url}
                        alt={`${person.name} Name`}
                    />
                    <Typography variant="h5">{person.name}</Typography>
                    <Typography variant="body1">{person.year}</Typography>
                    <Typography variant="body1" sx={{ fontStyle: 'italic' }}>{person.major}</Typography>
                    <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                        Favorite Artist: <RouterLink to={`/artist/${encodeURIComponent(person.artist_name)}`} style={{ textDecoration: 'none', color : '#333'}}>
                        {person.artist_name}
                    </RouterLink>
                    </Typography>

                </Box>
            )}
        </Container>
    );
}
