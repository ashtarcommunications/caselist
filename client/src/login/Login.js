import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { useAuth } from '../helpers/auth';

import styles from './Login.module.css';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const auth = useAuth();

    const {
        register,
        formState: { errors, isValid },
        handleSubmit,
        reset,
    } = useForm({
        mode: 'all',
        defaultValues: {
            username: '',
            password: '',
            remember: true,
        },
    });

    const [fetching, setFetching] = useState(false);
    const [serverError, setServerError] = useState(null);

    const onSubmit = async (data) => {
        try {
            setFetching(true);
            await auth.handleLogin(data.username, data.password, data.remember);
            const { from } = location.state || { from: { pathname: '/' } };
            setFetching(false);
            navigate(from);
        } catch (err) {
            setFetching(false);
            console.log(err);
            setServerError(err.message);
            reset({}, { keepDefaultValues: true });
        }
    };

    return (
        <div className={styles.login}>
            <p>Login with your <a href="https://tabroom.com">Tabroom.com</a> username and password</p>
            <form className={`${styles['login-form']} pure-form pure-form-stacked`} onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label htmlFor="username">Username</label>
                    <input id="username" type="text" className={errors.username && styles.invalid} {...register('username', { required: true })} />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" className={errors.password && styles.invalid} {...register('password', { required: true })} />
                </div>
                <div>
                    <input id="remember" type="checkbox" defaultChecked {...register('remember')} />
                    <span className={styles.remember}> Remember Me</span>
                </div>
                <button className={`${styles.button} pure-button`} type="submit" disabled={fetching || !isValid}>Login</button>
            </form>

            {serverError && <p className={styles.error}>{serverError}</p>}

            <p>
                <a href="https://www.tabroom.com">Forgot Password?</a>
                <span> | </span>
                <a href="https://www.tabroom.com">Register</a>
            </p>
        </div>
    );
};

export default Login;
