// import React from 'react';
// import { Redirect } from 'react-router-dom';
import { useProvideAuth } from './auth';

const Logout = async () => {
    /// const history = useHistory();
    const auth = useProvideAuth();
    await auth.handleLogout();
    // history.replace({ from: { pathname: '/' } });

    // return <Redirect to="/" />;
};

export default Logout;
