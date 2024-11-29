import React from 'react';
import { assert } from 'vitest';
import { startOfYear } from '@speechanddebate/nsda-js-utils';

import {
	wrappedRender as render,
	screen,
	fireEvent,
	waitFor,
} from '../setupTests';
import { store } from '../helpers/store';
import OpenEvSidebar from './OpenEvSidebar';

describe('OpenEv Sidebar', () => {
	it('Renders a sidebar', async () => {
		render(<OpenEvSidebar />, {
			route: '/openev/:year/:tag',
			path: `/openev/${startOfYear()}/da`,
		});

		await waitFor(() =>
			assert.strictEqual(
				store.fetchOpenEvFiles.mock.calls.length,
				1,
				'Fetched Open Ev Files',
			),
		);
		await screen.findByText(/Files By Camp/);
		await screen.findByText(/Files By Type/);
		await screen.findByText(/Archive/);
	});

	it('Renders an error message without openEvFiles', async () => {
		const defaultOpenEvFiles = store.openEvFiles;
		store.openEvFiles = { message: 'No files' };
		render(<OpenEvSidebar />, {
			route: '/openev/:year/:tag',
			path: `/openev/${startOfYear()}/da`,
		});
		await waitFor(() =>
			assert.isOk(screen.queryAllByText('No files'), 'Error message exists'),
		);
		store.openEvFiles = defaultOpenEvFiles;
	});

	it('Toggles sidebar visibility', async () => {
		render(<OpenEvSidebar />, {
			route: '/openev/:year/:tag',
			path: `/openev/${startOfYear()}/da`,
		});

		const collapse = await screen.findByText(/«/);
		fireEvent.click(collapse);
		await screen.findByText(/»/);
	});
});
