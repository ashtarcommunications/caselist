import React from 'react';

const Untrusted = () => {
    let message = 'You must be a real student, judge, or coach on Tabroom to post on the caselist. ';
    message += 'If you think this determination is in error, try waiting a few days and then log in again. ';
    message += 'Until then, your account is in read-only mode, so you can browse, but not post.';

    return (
        <div>
            <h3>Account Untrusted</h3>
            <p>{message}</p>
        </div>
    );
};

export default Untrusted;
