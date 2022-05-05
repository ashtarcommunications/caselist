import React from 'react';

import styles from './Loader.module.css';

export const Loader = () => {
    return (
        <div className={styles.flex}><div className={styles.loader} aria-label="circle loading animation" /></div>
    );
};

export default Loader;
