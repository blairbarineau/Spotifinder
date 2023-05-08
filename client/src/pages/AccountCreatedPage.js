import React from 'react';
import { useNavigate } from 'react-router-dom';

//essentially an aethetic page kinda fun
export default function AccountCreatedPage() {
    const navigate = useNavigate();

    return (
        <div className="auth-form-container">
            <h2>Account Successfully Created!</h2>
            <button className="link-btn" onClick={() => navigate('/')}>Navigate Back To LoginPage.</button>
        </div>
    )
}
