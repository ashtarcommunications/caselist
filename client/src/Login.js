import React from 'react';
import Cookies from 'js-cookie';
import { useForm } from 'react-hook-form';
import { login } from './api';

function Login() {
    const { register, handleSubmit } = useForm();
    const onSubmit = async (data) => {
        try {
            const response = await login(data.username, data.password);
            Cookies.set('caselist_token', response.token);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="login">
            <h1>Login</h1>
            <p>Login with your Tabroom.com username and password</p>
            <form onSubmit={handleSubmit(onSubmit)}>
                Username:<input type="text" {...register('username')} />
                Password:<input type="password" {...register('password')} />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;
