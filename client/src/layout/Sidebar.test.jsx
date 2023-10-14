import React from 'react';
import { assert } from 'chai';
import { vi } from 'vitest';

import { wrappedRender as render, screen, fireEvent } from '../setupTests';
// eslint-disable-next-line import/named
import { store } from '../helpers/store';
import Sidebar from './Sidebar';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: vi.fn().mockImplementation(() => ({ caselist: 'testcaselist', school: 'testschool', team: 'testteam' })),
    };
});

describe('Sidebar', () => {
    it('Renders a sidebar', async () => {
        render(<Sidebar />);

        await screen.findByText(/Choose a Caselist/);
        await screen.findByText(/Test Caselist/);
        await screen.findByText(/Colorado/);
        assert.isOk(document.querySelector('select'), 'Dropdown exists');
        assert.isOk(document.querySelector('input'), 'Filter exists');
        assert.isOk(screen.queryByText(/Schools/), 'Schools heading exists');
        assert.isOk(screen.queryByText(/Test School/), 'School Links exist');
        assert.isOk(screen.queryByText(/Create/), 'Add button exists');
        assert.isOk(screen.queryByText(/Recently Modified/), 'Recent link exists');
        assert.isOk(screen.queryByText(/Bulk Downloads/), 'Downloads link exists');
    });

    it('Returns false without caselist data', async () => {
        const defaultCaselistData = store.caselistData;
        store.caselistData = { message: 'No caselistData' };
        render(<Sidebar />);
        const caselist = screen.queryByText(/Choose a Caselist/);
        assert.isNotOk(caselist);
        store.caselistData = defaultCaselistData;
    });

    it('Toggles sidebar visibility', async () => {
        render(<Sidebar />);

        await screen.findByText(/Choose a Caselist/);
        await screen.findByText(/Test Caselist/);

        const collapse = await screen.findByText(/«/);
        fireEvent.click(collapse);
        await screen.findByText(/»/);
    });

    it('Shows an archive message', async () => {
        const defaultCaselistData = store.caselistData;
        store.caselistData = { archived: true };
        render(<Sidebar />);
        await screen.findByText(/Choose a Caselist/);
        await screen.findByText(/Test Caselist/);
        assert.isOk(screen.queryByText(/archived/));
        store.caselistData = defaultCaselistData;
    });
});
