import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../helpers/auth';
import Login from '../login/Login';
import './Home.css';

const Home = () => {
    const auth = useContext(AuthContext);
    return (
        <div className="home">
            <h1>Welcome to openCaselist</h1>
            <h2>Collaborative disclosure for the debate community</h2>
            {
                !auth.user?.loggedIn
                ? <Login />
                :
                <>
                    <div className="caselists">
                        <Link to="/ndtceda21"><div className="caselist ndt">NDT-CEDA</div></Link>
                        <Link to="/hspolicy21"><div className="caselist policy">NDCA HS Policy</div></Link>
                        <Link to="/hsld21"><div className="caselist ld">NDCA HS LD</div></Link>
                    </div>
                    <div className="caselists">
                        <Link to="/hspf21"><div className="caselist pf">NDCA HS PF</div></Link>
                        <Link to="/nfald21"><div className="caselist nfa">NFA-LD</div></Link>
                        <Link to="/openev"><div className="caselist openev">Open Evidence Project</div></Link>
                    </div>
                </>
            }
            <div>
                <p>This site is supported by:</p>
                <p>National Speech & Debate Association</p>
                <p>National Debate Coaches Association</p>
                <p>American Forensics Association</p>
                <p>California National Debate Institute</p>
            </div>
        </div>
    );
};

export default Home;
