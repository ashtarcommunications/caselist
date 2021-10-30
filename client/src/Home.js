import React from 'react';
import './Home.css';

const Home = () => {
    return (
        <div className="home">
            <h1>Welcome to openCaselist</h1>
            <h2>The home for collaborative disclosure for the debate community</h2>

            <div className="caselists">
                <div className="caselist"><span>NDT-CEDA 2021-2022</span></div>
                <div className="caselist"><span>HS Policy 2021-2022</span></div>
                <div className="caselist"><span>HS LD 2021-2022</span></div>
                <div className="caselist"><span>HS PF 2021-2022</span></div>
                <div className="caselist"><span>NFA-LD 2021-2022</span></div>
                <div className="caselist"><span>Open Evidence Project</span></div>
            </div>
        </div>
    );
};

export default Home;
