import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { AuthContext } from '../helpers/auth';

import styles from './Login.module.css';

const Login = () => {
    const { register, handleSubmit } = useForm();
    const navigate = useNavigate();
    const location = useLocation();
    const auth = useContext(AuthContext);
    const onSubmit = async (data) => {
        try {
            await auth.handleLogin(data.username, data.password);
            const { from } = location.state || { from: { pathname: '/' } };
            navigate(from);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className={styles.login}>
            <p>Login with your <a href="https://tabroom.com">Tabroom.com</a> username and password</p>
            <form className={`${styles['login-form']} pure-form pure-form-stacked`} onSubmit={handleSubmit(onSubmit)}>
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
                <button className={`${styles.button} pure-button`} type="submit">Login</button>
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
