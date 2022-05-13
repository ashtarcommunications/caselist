import React, { useState } from 'react';

import styles from './ConfirmButton.module.css';

const ConfirmButton = ({ message = 'Are you sure?', handler, dismiss, requireInput = false }) => {
    const [confirm, setConfirm] = useState('');

    const handleChangeConfirm = (e) => {
        setConfirm(e.currentTarget.value);
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); handler(); }} className="pure-form">
            <p>{message}</p>
            {
                requireInput &&
                <div>
                    <p>Please type &quot;I am certain&quot; below, exactly as shown</p>
                    <input autoFocus className={styles.confirm} type="text" pattern="I am certain" value={confirm} onChange={handleChangeConfirm} />
                </div>
            }
            <div>
                <button
                    type="submit"
                    className="pure-button green-button"
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
        </form>
    );
};

export default ConfirmButton;
