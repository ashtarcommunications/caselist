import React from 'react';
import { assert } from 'chai';
import { startOfYear } from '@speechanddebate/nsda-js-utils';

import { wrappedRender as render, screen, fireEvent, waitFor } from '../setupTests';
// eslint-disable-next-line import/named
import { store } from '../helpers/store';
import Sidebar from './Sidebar';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn().mockImplementation(() => ({ caselist: 'testcaselist', school: 'testschool', team: 'testteam' })),
}));

describe('Sidebar', () => {
    it('Renders a sidebar', async () => {
        render(<Sidebar />);

        await waitFor(() => screen.queryByText(`${startOfYear}-${startOfYear + 1}`));
        await waitFor(() => screen.queryByText(/Choose a Caselist/));
        await waitFor(() => screen.queryByText(/Test Caselist/));
        await waitFor(() => screen.queryByText(/Colorado/));
        assert.isOk(document.querySelector('select'), 'Dropdown exists');
        assert.isOk(screen.queryByText(/Schools/), 'Schools heading exists');
        assert.isOk(screen.queryByText(/Test School/), 'School Links exist');
        assert.isOk(screen.queryByText(/Add/), 'Add button exists');
        assert.isOk(screen.queryByText(/Recently Modified/), 'Recent link exists');
    });

    it('Returns false without caselist data', async () => {
        const defaultCaselistData = store.caselistData;
        store.caselistData = { message: 'No caselistData' };
        render(<Sidebar />);
        assert.isNull(document.querySelector('.sidebar'));
        store.caselistData = defaultCaselistData;
    });

    it('Toggles sidebar visibility', async () => {
        render(<Sidebar />);

        await waitFor(() => screen.queryByText(`${startOfYear}-${startOfYear + 1}`));
        await waitFor(() => screen.queryByText(/Choose a Caselist/));
        await waitFor(() => screen.queryByText(/Test Caselist/));
        const toggle = screen.queryByText(/«/);
        assert.isNotOk(document.querySelector('.sidebar-collapsed'));
        fireEvent.click(toggle);
        assert.isOk(document.querySelector('.sidebar-collapsed'));
    });

    it('Shows an archive message', async () => {
        const defaultCaselistData = store.caselistData;
        store.caselistData = { archived: true };
        render(<Sidebar />);
        await waitFor(() => screen.queryByText(`${startOfYear}-${startOfYear + 1}`));
        await waitFor(() => screen.queryByText(/Choose a Caselist/));
        await waitFor(() => screen.queryByText(/Test Caselist/));
        assert.isOk(screen.queryByText(/archived/));
        store.caselistData = defaultCaselistData;
    });
});
