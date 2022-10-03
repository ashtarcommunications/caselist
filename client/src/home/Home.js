import React from 'react';
import { Link } from 'react-router-dom';
import { startOfYear } from '@speechanddebate/nsda-js-utils';

import { useAuth } from '../helpers/auth';
import Login from '../login/Login';
import styles from './Home.module.css';

import nsda from './nsda.png';
import ndca from './ndca.png';
import afa from './afa.png';
import cndi from './cndi.png';

const Home = () => {
    const auth = useAuth();
    const shortYear = startOfYear.toString().slice(-2);
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
                        <Link to={`/ndtceda${shortYear}`}><div className={`${styles.caselist} ${styles.ndt}`}>NDT-CEDA</div></Link>
                        <Link to={`/hspolicy${shortYear}`}><div className={`${styles.caselist} ${styles.policy}`}>NDCA HS Policy</div></Link>
                        <Link to={`/hsld${shortYear}`}><div className={`${styles.caselist} ${styles.ld}`}>NDCA HS LD</div></Link>
                    </div>
                    <div className={styles.caselists}>
                        <Link to={`/hspf${shortYear}`}><div className={`${styles.caselist} ${styles.pf}`}>NDCA HS PF</div></Link>
                        <Link to={`/nfald${shortYear}`}><div className={`${styles.caselist} ${styles.nfa}`}>NFA College LD</div></Link>
                        <Link to="/openev"><div className={`${styles.caselist} ${styles.openev}`}>Open Evidence Project</div></Link>
                    </div>
                </>
            }
            <div className={styles.sponsors}>
                <h3>With support from</h3>
                <div className={styles.flex}>
                    <div className={styles.sponsor}>
                        <a href="https://speechanddebate.org" target="_blank" rel="noopener noreferrer">
                            <img alt="nsda" src={nsda} />
                            <p>National Speech &amp; <br />Debate Association</p>
                        </a>
                    </div>
                    <div className={styles.sponsor}>
                        <a href="https://debatecoaches.org" target="_blank" rel="noopener noreferrer">
                            <img alt="ndca" src={ndca} />
                            <p>National Debate<br />Coaches Association</p>
                        </a>
                    </div>
                    <div className={styles.sponsor}>
                        <a href="https://americanforensicsassoc.org" target="_blank" rel="noopener noreferrer">
                            <img alt="afa" src={afa} />
                            <p>American Forensic<br /> Association</p>
                        </a>
                    </div>
                    <div className={styles.sponsor}>
                        <a href="https://berkeleydebate.com" target="_blank" rel="noopener noreferrer">
                            <img alt="cndi" src={cndi} />
                            <p>California National<br />Debate Institute</p>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
