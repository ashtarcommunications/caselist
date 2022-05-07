import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../helpers/auth';

const Logout = () => {
    const auth = useContext(AuthContext);
    auth.handleLogout();

    return <Navigate to="/" />;
};

export default Logout;
