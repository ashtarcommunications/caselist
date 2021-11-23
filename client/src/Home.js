import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from './auth';
import Login from './Login';
import './Home.css';

const Home = () => {
    const auth = useContext(AuthContext);
    return (
        <div className="home">
            <h1>Welcome to openCaselist</h1>
            <h2>The home for collaborative disclosure for the debate community</h2>
            {
                !auth.user?.loggedIn
                ? <Login />
                :
                <div className="caselists">
                    <div className="caselist"><span><Link to="/ndtceda21">NDT-CEDA 2021-2022</Link></span></div>
                    <div className="caselist"><span><Link to="/hspolicy21">HS Policy 2021-2022</Link></span></div>
                    <div className="caselist"><span><Link to="/hsld21">HS LD 2021-2022</Link></span></div>
                    <div className="caselist"><span><Link to="/hspf21">HS PF 2021-2022</Link></span></div>
                    <div className="caselist"><span><Link to="/nfald21">NFA-LD 2021-2022</Link></span></div>
                    <div className="caselist"><span><Link to="/openev">Open Evidence Project</Link></span></div>
                </div>
            }
        </div>
    );
};

export default Home;
