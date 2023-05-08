
import {useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';

const config = require('../config.json');


export const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    // again handling the submit and searching the User info DB for a match
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        const response = await fetch(`http://${config.server_host}:${config.server_port}/login/${username}/${password}`);
        const result = await response.text();
        // if we are sucesful we go to the home page, otherwise we give an error
        if (result === 'success') {
            navigate('/homePage');
        } else {
            setErrorMessage('Sorry, these credentials are not valid. Please try again.');
        }
    }

    return (
        <div className="auth-form-container">
            <h2>Welcome to Spotifinder! Login with your username and password!</h2>

            <form className="login-form" onSubmit={handleSubmit}>
                <label htmlFor="username">username</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} type="username"
                       placeholder="username" id="username" name="username"/>
                <label htmlFor="password">password</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password"
                       placeholder="********" id="password" name="password"/>
                <button type="submit">Log In</button>
                {errorMessage && <p>{errorMessage}</p>}
            </form>

            <a href="/createUser" className="link-btn">Don't have an account? Register here.</a>
        </div>
    );
}
