import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config';

const CreateUserPage = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    // function to handle when a user submitts
    const handleSubmit = async (e) => {
        e.preventDefault();
        // we insert the user input into the db
        const response =
            await fetch(`http://${config.server_host}:${config.server_port}/create_user/${username}/${password}`);

        const result = await response.json();
        //check to see if a result which is outputted by our route handler
        if (result.success) {
            navigate('/AccountCreatedPage');
        } else {
            setErrorMessage('Sorry, there was an error creating your account. Please try again.');
        }
    };

    return (
        <div className="auth-form-container">
            <h2>Create a new account</h2>
            <form className="create-user-form" onSubmit={handleSubmit}>
                <label htmlFor="username">Username</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} type="text" placeholder="Username" id="username" name="username" />

                <label htmlFor="password">Password</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="********" id="password" name="password" />

                <button type="submit">Create Account</button>
                {errorMessage && <p>{errorMessage}</p>}
            </form>
            <button className="link-btn" onClick={() => navigate('/')}>Already have an account? Log in here.</button>
        </div>
    );
};

export default CreateUserPage;
