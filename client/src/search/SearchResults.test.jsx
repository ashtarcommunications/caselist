import React from 'react';
import { assert, vi } from 'vitest';

import { wrappedRender as render, screen, waitFor } from '../setupTests';
import { loadSearch } from '../helpers/api.js';

import SearchResults from './SearchResults';

// useSearch from wouter doesn't work in testing
// https://github.com/molefrog/wouter/issues/447
vi.mock('wouter', async () => {
	const actual = await vi.importActual('wouter');
	return {
		...actual,
		useSearch: () => 'q=search',
	};
});

describe('SearchResults', () => {
	it('Renders search results', async () => {
		render(<SearchResults />, {
			route: '/:caselist/:school/:team',
			path: '/testcaselist/testschool/testteam',
		});
		await waitFor(() =>
			assert.isOk(screen.queryAllByText(/Search Results/), 'Renders a heading'),
		);
		await waitFor(() =>
			assert.isOk(document.querySelector('input'), 'Renders a search form'),
		);
		await waitFor(() =>
			assert.isOk(screen.queryAllByText(/Test Team/), 'Renders a team result'),
		);
		await waitFor(() =>
			assert.isOk(screen.queryAllByText(/Test Snippet/), 'Renders a snippet'),
		);
		await waitFor(() =>
			assert.strictEqual(
				loadSearch.mock.calls.length,
				1,
				'Fetched search results',
			),
		);

		loadSearch.mockImplementation(() => [
			{ type: 'cite', title: 'Test Cite', path: '/' },
		]);
		render(<SearchResults />, {
			route: '/:caselist/:school/:team',
			path: '/testcaselist/testschool/testteam',
		});
		await waitFor(() =>
			assert.isOk(screen.queryByText(/Test Cite/), 'Renders a cite result'),
		);

		loadSearch.mockImplementation(() => [
			{ type: 'file', title: 'Test File', path: '/', download_path: '/' },
		]);
		render(<SearchResults />, {
			route: '/:caselist/:school/:team',
			path: '/testcaselist/testschool/testteam',
		});
		await waitFor(() =>
			assert.isOk(screen.queryAllByText(/File/), 'Renders a file result'),
		);
	});

	it('Renders nothing without a caselist or year', async () => {
		const view = render(<SearchResults />);
		render(<SearchResults />, {
			route: '/:caselist/:school/:team',
			path: '/?q=search',
		});
		assert.isNotOk(view.firstChild, 'Renders nothing');
	});

	it('Renders a message without results', async () => {
		loadSearch.mockImplementation(() => []);
		render(<SearchResults />, {
			route: '/:caselist',
			path: '/testcaselist',
		});
		await waitFor(() =>
			assert.isOk(screen.queryByText(/No results/), 'No results warning'),
		);
	});

	it('Renders an error message on results failure', async () => {
		loadSearch.mockRejectedValue({ message: 'Failed to load search results' });
		render(<SearchResults />, {
			route: '/:caselist',
			path: '/testcaselist',
		});
		await waitFor(() =>
			assert.isOk(screen.queryByTestId('loader'), 'Renders a loader'),
		);
		await waitFor(() =>
			assert.isOk(screen.queryAllByText(/Search Results/), 'Renders a heading'),
		);
		await waitFor(() =>
			assert.isOk(
				screen.queryByText(/Failed to load search results/),
				'Failure warning',
			),
		);
	});

	afterEach(() => {
		loadSearch.mockClear();
	});
});
