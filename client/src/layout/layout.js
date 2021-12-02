import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { AuthContext } from '../helpers/auth';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

const RouteWrapper = ({ privateRoute, location, children, ...rest }) => {
    const auth = useContext(AuthContext);

    return (
        <Route {...rest}>
            <Header />
            <div className="wrapper">
                {privateRoute && auth.user?.loggedIn && <Sidebar />}
                <div className="main">
                    {
                        // eslint-disable-next-line no-nested-ternary
                        !privateRoute ? children :
                            auth.user?.loggedIn
                            ? children
                            : <Redirect to={{ pathname: '/', state: { from: location } }} />
                    }
                </div>
            </div>
            <Footer />
        </Route>
    );
};

export default RouteWrapper;
