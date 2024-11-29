import React from 'react';
import { assert } from 'vitest';

import { wrappedRender as render, screen, waitFor } from '../setupTests';

import HistoryTable from './HistoryTable';

describe('HistoryTable', () => {
	it('Renders a history table for a school', async () => {
		render(<HistoryTable type="school" />, {
			route: '/:caselist/:school/:team',
			path: '/testcaselist/testschool/testteam',
		});

		await waitFor(() =>
			assert.isOk(
				screen.queryByText(/Test school history/),
				'Description exists',
			),
		);
		await waitFor(() => assert.isOk(screen.queryByText(/2023/), 'Date exists'));
		await waitFor(() =>
			assert.isOk(screen.queryByText(/Test User/), 'User exists'),
		);
	});

	it('Renders a history table for a team', async () => {
		render(<HistoryTable type="team" />, {
			route: '/:caselist/:school/:team',
			path: '/testcaselist/testschool/testteam',
		});

		await waitFor(() =>
			assert.isOk(
				screen.queryByText(/Test team history/),
				'Description exists',
			),
		);
		await waitFor(() => assert.isOk(screen.queryByText(/2023/), 'Date exists'));
		await waitFor(() =>
			assert.isOk(screen.queryByText(/Test User/), 'User exists'),
		);
	});
});
