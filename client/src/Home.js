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
                <>
                    <div className="caselists">
                        <Link to="/ndtceda21"><div className="caselist ndt">NDT-CEDA 2021-2022</div></Link>
                        <Link to="/hspolicy21"><div className="caselist policy">HS Policy 2021-2022</div></Link>
                        <Link to="/hsld21"><div className="caselist ld">HS LD 2021-2022</div></Link>
                    </div>
                    <div className="caselists">
                        <Link to="/hspf21"><div className="caselist pf">HS PF 2021-2022</div></Link>
                        <Link to="/nfald21"><div className="caselist nfa">NFA-LD 2021-2022</div></Link>
                        <Link to="/openev"><div className="caselist openev">Open Evidence Project</div></Link>
                    </div>
                </>
            }
        </div>
    );
};

export default Home;
