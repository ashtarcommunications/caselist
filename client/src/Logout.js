import React, { useContext } from 'react';
import { Redirect } from 'react-router-dom';
import { AuthContext } from './auth';

const Logout = () => {
    const auth = useContext(AuthContext);
    auth.handleLogout();

    return <Redirect to="/" />;
};

export default Logout;
