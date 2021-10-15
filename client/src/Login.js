import React, { useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AuthContext } from './auth';
import './Login.css';

const Login = () => {
    const { register, handleSubmit } = useForm();
    const history = useHistory();
    const location = useLocation();
    const auth = useContext(AuthContext);
    const onSubmit = async (data) => {
        try {
            await auth.handleLogin(data.username, data.password);
            console.log(location);
            const { from } = location.state || { from: { pathname: '/' } };
            console.log(from);
            history.replace(from);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="login">
            <h1>Welcome to openCaselist</h1>
            <p>Login with your <a href="https://tabroom.com">Tabroom.com</a> username and password</p>
            <form className="pure-form pure-form-stacked" onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label htmlFor="username">Username</label>
                    <input id="username" type="text" {...register('username')} />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" {...register('password')} />
                </div>
                <div>
                    <input id="remember" type="checkbox" defaultChecked {...register('remember')} /> Remember Me
                </div>
                <button className="button pure-button pure-button-primary" type="submit">Login</button>
            </form>
            <p>
                <a href="https://tabroom.com">Forgot Password?</a>
                <span> | </span>
                <a href="https://tabroom.com">Register</a>
            </p>
        </div>
    );
};

export default Login;
