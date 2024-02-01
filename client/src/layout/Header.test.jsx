import React from 'react';
import { assert } from 'chai';
import { vi } from 'vitest';

import { wrappedRender as render, screen, waitFor } from '../setupTests';
// eslint-disable-next-line import/named
import { auth } from '../helpers/auth';
import Header from './Header';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: vi.fn().mockImplementation(() => ({ caselist: 'testcaselist', school: 'testschool', team: 'testteam', year: '2022', tag: 'aff' })),
        uselocation: vi.fn().mockImplementation(() => ({ pathname: 'openev' })),
    };
});

describe('Header', () => {
    it('Renders a header', async () => {
        render(<Header />);

        await waitFor(() => assert.isOk(screen.queryByText('openCaselist'), 'Home logo exists'));

        await waitFor(() => assert.isOk(document.querySelector('input[type="search"]'), 'Search form exists'));
        await waitFor(() => assert.isOk(screen.queryByText('Logout'), 'Logout link exists'));
    });

    it('Does not render search or logout for non-logged-in users', async () => {
        auth.user.loggedIn = false;
        render(<Header />);

        await waitFor(() => assert.isNotOk(document.querySelector('input[type="search"]'), 'No search form'));
        await waitFor(() => assert.isNotOk(screen.queryByText('Logout'), 'No logout link'));
        auth.user.loggedIn = true;
    });

    it('Renders a warning for untrusted users', async () => {
        auth.user.trusted = false;
        render(<Header />);

        await waitFor(() => assert.isOk(screen.queryByText('Account Untrusted'), 'Warning exists'));
        auth.user.trusted = true;
    });
});
