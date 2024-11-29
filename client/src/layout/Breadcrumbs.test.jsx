import React from 'react';
import { assert } from 'vitest';

import { wrappedRender as render, screen, waitFor } from '../setupTests';
import Breadcrumbs from './Breadcrumbs';

describe('Home', () => {
	it('Renders caselist breadcrumbs', async () => {
		render(<Breadcrumbs />, {
			route: '/:caselist/:school/:team',
			path: '/testcaselist/testschool/testteam',
		});

		await waitFor(() =>
			assert.isOk(document.querySelector('.home'), 'Home icon exists'),
		);

		assert.isOk(screen.queryByText(/testcaselist/), 'Caselist link');
		assert.isOk(screen.queryByText(/Test School/), 'School link');
		assert.isOk(screen.queryByText(/testteam/), 'Team link');
	});

	it('Renders open ev breadcrumbs', async () => {
		render(<Breadcrumbs />, {
			route: '/openev/:year/:tag',
			path: '/openev/2022/aff',
		});

		assert.isOk(screen.queryByText(/2022/), 'Year link');
		assert.isOk(screen.queryByText(/Affirmatives/), 'Tag link');
	});
});
