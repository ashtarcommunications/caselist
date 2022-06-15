import React from 'react';
import { assert } from 'chai';

import { wrappedRender as render, screen, waitFor } from '../setupTests';
// eslint-disable-next-line import/named
import { auth } from '../helpers/auth';
import Layout from './Layout';

describe('Layout', () => {
    it('Renders a layout', async () => {
        render(<Layout><p className="test" /></Layout>);

        await waitFor(() => assert.isOk(document.querySelector('header'), 'Header exists'));
        await waitFor(() => assert.isOk(document.querySelector('.wrapper'), 'Wrapper div exists'));
        await waitFor(() => assert.isOk(document.querySelector('.main'), 'Main div exists'));
        await waitFor(() => assert.isOk(document.querySelector('footer'), 'Footer exists'));
        await waitFor(() => assert.isOk(document.querySelector('.test'), 'Renders children'));
    });

    it('Render a sidebar on private route', async () => {
        render(<Layout privateRoute />);

        await waitFor(() => assert.isOk(screen.queryByText(/Schools/), 'Sidebar exists'));
    });

    it('Render an openev sidebar', async () => {
        render(<Layout privateRoute openev />);

        await waitFor(() => assert.isOk(screen.queryByText(/Files By Camp/), 'Open Ev Sidebar exists'));
    });

    it('Does not render private route layout for non-logged-in users', async () => {
        auth.user.loggedIn = false;
        render(<Layout />);

        await waitFor(() => assert.isNotOk(screen.queryByText(/Schools/), 'Sidebar exists'));
        auth.user.loggedIn = true;
    });
});
