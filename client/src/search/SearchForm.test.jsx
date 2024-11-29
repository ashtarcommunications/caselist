import React from 'react';
import { assert } from 'vitest';

import {
	wrappedRender as render,
	screen,
	fireEvent,
	waitFor,
	router,
} from '../setupTests';

import SearchForm from './SearchForm';

describe('SearchForm', () => {
	it('Renders and submits a search form', async () => {
		render(<SearchForm />, {
			route: '/:caselist/:school/:team',
			path: '/testcaselist/testschool/testteam',
		});
		assert.isOk(document.querySelector('input'), 'Form exists');
		fireEvent.change(document.querySelector('input'), {
			target: { value: 'update' },
		});
		const button = screen.getByRole('button');
		fireEvent.click(button);

		await waitFor(() =>
			assert.isAtLeast(router.history?.length, 2, 'Navigated to next page'),
		);
	});

	it('Works for open evidence', async () => {
		render(<SearchForm />, { route: '/openev/:year', path: '/openev/2021' });
		fireEvent.change(document.querySelector('input'), {
			target: { value: 'update' },
		});
		fireEvent.click(screen.getByRole('button'));
		await waitFor(() =>
			assert.isAtLeast(router.history?.length, 2, 'Navigated to next page'),
		);
	});

	it('Works for open evidence without a year', async () => {
		render(<SearchForm />, { route: '/openev', path: '/openev' });
		fireEvent.change(document.querySelector('input'), {
			target: { value: 'update' },
		});
		fireEvent.click(screen.getByRole('button'));
		await waitFor(() =>
			assert.isAtLeast(router.history?.length, 2, 'Navigated to next page'),
		);
	});
});
