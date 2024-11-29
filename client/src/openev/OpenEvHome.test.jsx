import React from 'react';
import { assert } from 'vitest';
import { startOfYear } from '@speechanddebate/nsda-js-utils';

import { wrappedRender as render, screen, waitFor } from '../setupTests';
import OpenEvHome from './OpenEvHome';
import { store } from '../helpers/store';

describe('OpenEvHome', () => {
	it('Renders an openev homepage', async () => {
		render(<OpenEvHome />, { route: '/openev', path: '/openev' });
		await waitFor(() =>
			assert.isOk(document.querySelector('.home'), 'Breadcrumbs exists'),
		);
		await waitFor(() =>
			assert.isOk(screen.queryByText(/Open Evidence Files/), 'Heading exists'),
		);
		await waitFor(() =>
			assert.isOk(screen.queryByText(/Test.docx/), 'Table exists'),
		);
		await waitFor(() =>
			assert.isOk(screen.queryByText(/Add File/), 'Button exists'),
		);
	});

	it('Renders an error message without openEvFiles', async () => {
		const defaultOpenEvFiles = store.openEvFiles;
		store.openEvFiles = { message: 'No files' };
		render(<OpenEvHome />, { route: '/openev', path: '/openev' });
		await waitFor(() =>
			assert.isOk(screen.queryAllByText('No files'), 'Error message exists'),
		);
		store.openEvFiles = defaultOpenEvFiles;
	});

	it('Renders files for a year and tag', async () => {
		render(<OpenEvHome />, {
			route: '/openev/:year/:tag',
			path: `/openev/${startOfYear()}/da`,
		});
		await waitFor(() =>
			assert.isOk(screen.queryByText(/Test.docx/), 'Table exists'),
		);
	});
});
