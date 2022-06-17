import React from 'react';
import { assert } from 'chai';
import { useParams } from 'react-router-dom';

import { wrappedRender as render, screen, waitFor } from '../setupTests';
// eslint-disable-next-line import/named
import { loadSearch } from '../helpers/api';

import SearchResults from './SearchResults';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn().mockImplementation(() => ({ caselist: 'testcaselist', school: 'testschool', team: 'testteam' })),
}));

describe('SearchResults', () => {
    it('Renders search results', async () => {
        render(<SearchResults />);
        await waitFor(() => assert.isOk(screen.queryByText(/Search Results/), 'Renders a heading'));
        await waitFor(() => assert.isOk(document.querySelector('input'), 'Renders a search form'));
        await waitFor(() => assert.isOk(screen.queryAllByText(/Test Team/), 'Renders a team result'));
        await waitFor(() => assert.isOk(screen.queryByText(/Test Snippet/), 'Renders a snippet'));
        await waitFor(() => assert.strictEqual(loadSearch.mock.calls.length, 1, 'Fetched search results'));

        loadSearch.mockImplementation(() => ([{ type: 'cite', title: 'Test Cite', path: '/' }]));
        render(<SearchResults />);
        await waitFor(() => assert.isOk(screen.queryByText(/Test Cite/), 'Renders a cite result'));

        loadSearch.mockImplementation(() => ([{ type: 'file', title: 'Test File', path: '/', download_path: '/' }]));
        render(<SearchResults />);
        await waitFor(() => assert.isOk(screen.queryAllByText(/File/), 'Renders a file result'));
    });

    it('Renders nothing without a caselist or year', async () => {
        useParams.mockImplementation(() => ({ caselist: null, year: null }));
        const container = render(<SearchResults />);
        assert.isNotOk(container.firstChild, 'Renders nothing');
    });

    it('Renders a message without results', async () => {
        useParams.mockImplementation(() => ({ caselist: 'testcaselist' }));
        loadSearch.mockImplementation(() => ([]));
        render(<SearchResults />);
        await waitFor(() => assert.isOk(screen.queryByText(/No results/), 'No results warning'));
    });

    it('Renders an error message on results failure', async () => {
        useParams.mockImplementation(() => ({ caselist: 'testcaselist' }));
        loadSearch.mockRejectedValue({ message: 'Failed to load search results' });
        render(<SearchResults />);
        await waitFor(() => assert.isOk(document.querySelector('.loader'), 'Renders a loader'));
        await waitFor(() => assert.isOk(screen.queryByText(/Search Results/), 'Renders a heading'));
        await waitFor(() => assert.isOk(screen.queryByText(/Failed to load search results/), 'Failure warning'));
    });

    afterEach(() => {
        loadSearch.mockClear();
        useParams.mockClear();
    });
});
