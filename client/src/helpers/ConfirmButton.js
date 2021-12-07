import React from 'react';

const ConfirmButton = ({ message = 'Are you sure?', handler }) => (
    <div>
        <p>{message}</p>
        <button
            type="button"
            className="pure-button pure-button-primary"
            onClick={handler}
        >
            Confirm
        </button>
    </div>
);

export default ConfirmButton;
