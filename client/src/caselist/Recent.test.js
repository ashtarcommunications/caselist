import React from 'react';
import { assert } from 'chai';

import { wrappedRender as render, screen, waitFor } from '../setupTests';
import Recent from './Recent';
import { loadRecent } from '../helpers/api';
// eslint-disable-next-line import/named
import { store } from '../helpers/store';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({
        caselist: 'test',
    }),
}));

describe('Recent', () => {
    it('Renders a recent modifications page', async () => {
        render(<Recent />);
        await waitFor(() => assert.isOk(screen.queryByLabelText('circle loading animation'), 'Loader exists'));
        await waitFor(() => assert.isOk(screen.queryByText('Recently Modified in Test Caselist'), 'Heading exists'));
        await waitFor(() => assert.isOk(screen.queryByText('Test Team'), 'Recent modification listed'));
        assert.strictEqual(loadRecent.mock.calls.length, 1, 'Fetched recent modificaitons');
    });

    it('Renders an error message without caselistData', async () => {
        const defaultCaselistData = store.caselistData;
        store.caselistData = { message: 'No caselistData' };
        render(<Recent />);
        await waitFor(() => assert.isOk(screen.queryAllByText('No caselistData'), 'Error message exists'));
        store.caselistData = defaultCaselistData;
    });

    it('Handles failure to fetch recent modifications', async () => {
        loadRecent.mockRejectedValue(() => { throw new Error('Failed to fetch recent modifications'); });
        render(<Recent />);
        assert.strictEqual(loadRecent.mock.calls.length, 1, 'Attempted to fetch recent modifications');
        await waitFor(() => assert.isOk(screen.queryByText('Recently Modified in Test Caselist'), 'Heading exists'));
    });

    afterEach(() => {
        loadRecent.mockReset();
    });
});
