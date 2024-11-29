import React from 'react';
import { assert } from 'vitest';

import { wrappedRender as render, screen, waitFor } from '../setupTests';
import Downloads from './Downloads';
import { loadDownloads } from '../helpers/api.js';
import { store } from '../helpers/store';

describe('Downloads', () => {
	it('Renders a bulk downloads page', async () => {
		render(<Downloads />, { route: '/:caselist', path: '/test' });
		await waitFor(() =>
			assert.isOk(
				screen.queryByLabelText('circle loading animation'),
				'Loader exists',
			),
		);
		await waitFor(() =>
			assert.isOk(
				screen.queryByText('Bulk downloads for Test Caselist'),
				'Heading exists',
			),
		);
		await waitFor(() =>
			assert.isOk(
				screen.queryByText('testcaselist-all.zip'),
				'All download link listed',
			),
		);
		await waitFor(() =>
			assert.isOk(
				screen.queryByText('testcaselist-weekly.zip'),
				'Weekly download link listed',
			),
		);
		assert.strictEqual(loadDownloads.mock.calls.length, 1, 'Fetched downloads');
	});

	it('Renders an error message without caselistData', async () => {
		const defaultCaselistData = store.caselistData;
		store.caselistData = { message: 'No caselistData' };
		render(<Downloads />, { route: '/:caselist', path: '/test' });
		await waitFor(() =>
			assert.isOk(
				screen.queryAllByText('No caselistData'),
				'Error message exists',
			),
		);
		store.caselistData = defaultCaselistData;
	});

	it('Handles failure to fetch downloads', async () => {
		loadDownloads.mockRejectedValue(() => {
			throw new Error('Failed to fetch downloads');
		});
		render(<Downloads />, { route: '/:caselist', path: '/test' });
		assert.strictEqual(
			loadDownloads.mock.calls.length,
			1,
			'Attempted to fetch downloads',
		);
		await waitFor(() =>
			assert.isOk(
				screen.queryByText('Bulk downloads for Test Caselist'),
				'Heading exists',
			),
		);
	});

	afterEach(() => {
		loadDownloads.mockClear();
	});
});
