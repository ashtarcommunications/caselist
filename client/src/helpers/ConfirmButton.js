import React, { useState } from 'react';

import styles from './ConfirmButton.module.css';

const ConfirmButton = ({ message = 'Are you sure?', handler, dismiss, requireInput = false }) => {
    const [confirm, setConfirm] = useState('');

    const handleChangeConfirm = (e) => {
        setConfirm(e.target.value);
    };

    return (
        <div>
            <p>{message}</p>
            {
                requireInput &&
                <form className="pure-form">
                    <p>Please type &quot;I am certain&quot; below, exactly as shown</p>
                    <input className={styles.confirm} type="text" value={confirm} onChange={handleChangeConfirm} />
                </form>
            }
            <div>
                <button
                    type="button"
                    className="pure-button green-button"
                    onClick={handler}
                    disabled={requireInput && confirm !== 'I am certain'}
                >
                    Confirm
                </button>
                <button
                    type="button"
                    className={`${styles.cancel} pure-button`}
                    onClick={dismiss}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default ConfirmButton;
