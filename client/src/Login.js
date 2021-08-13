import React from 'react';
import { login } from './api';

function Login() {
    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            await login('test@test.com', 'test');
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="login">
            <h1>Login</h1>
            <p>Login with your Tabroom.com username and password</p>
            <form onSubmit={submitHandler}>
                Username:<input type="text" />
                Password:<input type="password" />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;
