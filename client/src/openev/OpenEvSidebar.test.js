import React from 'react';
import { assert } from 'chai';
import { startOfYear } from '@speechanddebate/nsda-js-utils';

import { wrappedRender as render, screen, fireEvent, waitFor } from '../setupTests';
// eslint-disable-next-line import/named
import { store } from '../helpers/store';
import OpenEvSidebar from './OpenEvSidebar';

const mockStartOfYear = startOfYear;
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn().mockImplementation(() => ({ year: mockStartOfYear, tag: 'da' })),
}));

describe('OpenEv Sidebar', () => {
    it('Renders a sidebar', async () => {
        render(<OpenEvSidebar />);

        await waitFor(() => assert.strictEqual(store.fetchOpenEvFiles.mock.calls.length, 1, 'Fetched Open Ev Files'));
        await waitFor(() => screen.queryByText(`Files By Camp ${startOfYear}`));
        await waitFor(() => screen.queryByText(`Files By Type ${startOfYear}`));
        await waitFor(() => screen.queryByText(/Archive/));
    });

    it('Renders an error message without openEvFiles', async () => {
        const defaultOpenEvFiles = store.openEvFiles;
        store.openEvFiles = { message: 'No files' };
        render(<OpenEvSidebar />);
        await waitFor(() => assert.isOk(screen.queryAllByText('No files'), 'Error message exists'));
        store.openEvFiles = defaultOpenEvFiles;
    });

    it('Toggles sidebar visibility', async () => {
        render(<OpenEvSidebar />);

        const toggle = screen.queryByText(/«/);
        assert.isNotOk(document.querySelector('.sidebar-collapsed'));
        fireEvent.click(toggle);
        assert.isOk(document.querySelector('.sidebar-collapsed'));
    });
});
