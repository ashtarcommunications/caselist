import React from 'react';
import { assert } from 'chai';

import { wrappedRender as render, screen, waitFor } from '../setupTests';
import Home from './Home';
// eslint-disable-next-line import/named
import { auth } from '../helpers/auth';

describe('Home', () => {
    it('Renders a homepage', async () => {
        render(<Home />);
        await waitFor(() => assert.isOk(screen.queryByText('Welcome to openCaselist'), 'Heading exists'));
        assert.isOk(screen.queryByText('NDT-CEDA'), 'NDT Caselist');
        assert.isOk(screen.queryByText('NDCA HS Policy'), 'HS Policy Caselist');
        assert.isOk(screen.queryByText('NDCA HS LD'), 'HS LD Caselist');
        assert.isOk(screen.queryByText('NDCA HS PF'), 'HS PF Caselist');
        assert.isOk(screen.queryByText('NFA College LD'), 'NFA Caselist');
        assert.isOk(screen.queryByText('Open Evidence Project'), 'Open Ev');
        assert.isOk(document.querySelector('.sponsors'), 'Sponsors');

        assert.isNotOk(screen.queryByText('Login'), 'No login screen when logged in');
    });

    it('Renders a login screen', async () => {
        auth.user.loggedIn = false;
        render(<Home />);
        assert.isOk(screen.queryByText('Login'), 'Login screen');
        auth.user.loggedIn = true;
    });
});
