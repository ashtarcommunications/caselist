import React from 'react';
import { assert } from 'chai';
import { startOfYear } from '@speechanddebate/nsda-js-utils';
import { vi } from 'vitest';

import { wrappedRender as render, screen, fireEvent, waitFor } from '../setupTests';
// eslint-disable-next-line import/named
import { store } from '../helpers/store';
import OpenEvSidebar from './OpenEvSidebar';

const mockStartOfYear = startOfYear;
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: vi.fn().mockImplementation(() => ({ year: mockStartOfYear, tag: 'da' })),
    };
});

describe('OpenEv Sidebar', () => {
    it('Renders a sidebar', async () => {
        render(<OpenEvSidebar />);

        await waitFor(() => assert.strictEqual(store.fetchOpenEvFiles.mock.calls.length, 1, 'Fetched Open Ev Files'));
        await screen.findByText(/Files By Camp/);
        await screen.findByText(/Files By Type/);
        await screen.findByText(/Archive/);
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

        const collapse = await screen.findByText(/«/);
        fireEvent.click(collapse);
        await screen.findByText(/»/);
    });
});
