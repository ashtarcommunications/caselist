import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../helpers/auth';
import Login from '../login/Login';
import styles from './Home.module.css';

const Home = () => {
    const auth = useContext(AuthContext);
    return (
        <div className={styles.home}>
            <h1>Welcome to openCaselist</h1>
            <h2>Collaborative disclosure for the debate community</h2>
            {
                !auth.user?.loggedIn
                ? <Login />
                :
                <>
                    <div className={styles.caselists}>
                        <Link to="/ndtceda21"><div className={`${styles.caselist} ${styles.ndt}`}>NDT-CEDA</div></Link>
                        <Link to="/hspolicy21"><div className={`${styles.caselist} ${styles.policy}`}>NDCA HS Policy</div></Link>
                        <Link to="/hsld21"><div className={`${styles.caselist} ${styles.ld}`}>NDCA HS LD</div></Link>
                    </div>
                    <div className={styles.caselists}>
                        <Link to="/hspf21"><div className={`${styles.caselist} ${styles.pf}`}>NDCA HS PF</div></Link>
                        <Link to="/nfald21"><div className={`${styles.caselist} ${styles.nfa}`}>NFA-LD</div></Link>
                        <Link to="/openev"><div className={`${styles.caselist} ${styles.openev}`}>Open Evidence Project</div></Link>
                    </div>
                </>
            }
            <div>
                <p>This site is supported by:</p>
                <p>National Speech &amp; Debate Association</p>
                <p>National Debate Coaches Association</p>
                <p>American Forensics Association</p>
                <p>California National Debate Institute</p>
            </div>
        </div>
    );
};

export default Home;
