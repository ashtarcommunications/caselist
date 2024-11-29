import React from 'react';
import { assert } from 'vitest';

import {
	wrappedRender as render,
	screen,
	fireEvent,
	waitFor,
} from '../setupTests';
import { loadRound, updateRound } from '../helpers/api.js';
import { store } from '../helpers/store';
import { auth } from '../helpers/auth';

import EditRound from './EditRound';

describe('EditRound', () => {
	it('Renders and submits an edit round form', async () => {
		render(<EditRound />, {
			route: '/:caselist/:school/:team/:round?',
			path: '/testcaselist/testschool/testteam/1',
		});
		await waitFor(() =>
			assert.isOk(screen.queryByTestId('loader'), 'Loader exists'),
		);
		await waitFor(() =>
			assert.isNotOk(screen.queryByTestId('loader'), 'Loader disappears'),
		);
		await waitFor(() =>
			assert.strictEqual(loadRound.mock.calls.length, 1, 'Called loadRound'),
		);

		await waitFor(() =>
			assert.strictEqual(
				document.querySelector('input[name="tournament"]').value,
				'Tournament',
				'Correct tournament',
			),
		);
		assert.strictEqual(
			document.querySelector('#side').value,
			'A',
			'Correct side',
		);
		assert.strictEqual(
			document.querySelector('#round').value,
			'1',
			'Correct round',
		);
		assert.strictEqual(
			document.querySelector('input[name="opponent"]').value,
			'Opponent',
			'Correct opponent',
		);
		assert.strictEqual(
			document.querySelector('input[name="judge"]').value,
			'Judge',
			'Correct judge',
		);
		assert.strictEqual(
			document.querySelector('textarea[name="report"]').value,
			'Report',
			'Correct report',
		);
		assert.strictEqual(
			document.querySelector('input[name="video"]').value,
			'Video',
			'Correct video',
		);
		await waitFor(() =>
			assert.isOk(screen.queryByText(/test.docx/), 'Correct open source'),
		);
		await waitFor(() =>
			assert.isOk(screen.queryByTestId('trash'), 'Delete icon exists'),
		);
		fireEvent.click(screen.queryByTestId('trash'));
		await waitFor(() =>
			assert.isNotOk(screen.queryByText(/test.docx/), 'Removed open source'),
		);

		const form = document.querySelector('form');
		fireEvent.submit(form);
		await waitFor(() =>
			assert.strictEqual(
				document.querySelector('input[name="tournament"]').value,
				'',
				'Tournament reset',
			),
		);
		await waitFor(() =>
			assert.isOk(
				screen.queryByText('Successfully updated round'),
				'Success notification exists',
			),
		);
		await waitFor(() =>
			assert.strictEqual(
				updateRound.mock.calls.length,
				1,
				'Called updateRound',
			),
		);
	});

	it('Displays an error message on failure', async () => {
		updateRound.mockRejectedValue({ message: 'Failed to update round' });

		render(<EditRound />, {
			route: '/:caselist/:school/:team/:round',
			path: '/testcaselist/testschool/testteam/1',
		});
		await waitFor(() =>
			assert.isNotOk(screen.queryByTestId('loader'), 'Loader disappears'),
		);

		fireEvent.change(document.querySelector('input[name="tournament"]'), {
			target: { value: 'Update' },
		});
		await waitFor(() =>
			assert.strictEqual(
				document.querySelector('input[name="tournament"]').value,
				'Update',
				'Correct tournament value',
			),
		);

		const form = document.querySelector('form');
		fireEvent.submit(form);
		await waitFor(() =>
			assert.isOk(
				screen.queryByText(/Failed to update round/),
				'Failure notification exists',
			),
		);
	});

	it('Renders an untrusted message without a trusted user', async () => {
		auth.user.trusted = false;
		render(<EditRound />, {
			route: '/:caselist/:school/:team/:round',
			path: '/testcaselist/testschool/testteam/1',
		});
		await waitFor(() =>
			assert.isOk(
				screen.queryAllByText('Account Untrusted'),
				'Untrusted message exists',
			),
		);
		auth.user.trusted = true;
	});

	it('Renders an error message for an archived caselist', async () => {
		store.caselistData.archived = true;
		render(<EditRound />, {
			route: '/:caselist/:school/:team/:round',
			path: '/testcaselist/testschool/testteam/1',
		});
		await waitFor(() =>
			assert.isOk(
				screen.queryByText(/caselist is archived/),
				'Error message exists',
			),
		);
		store.caselistData.archived = false;
	});

	it('Renders an error message without caselistData', async () => {
		const defaultCaselistData = store.caselistData;
		store.caselistData = { message: 'No caselistData' };
		render(<EditRound />, {
			route: '/:caselist/:school/:team/:round',
			path: '/testcaselist/testschool/testteam/1',
		});
		await waitFor(() =>
			assert.isOk(
				screen.queryAllByText('No caselistData'),
				'Error message exists',
			),
		);
		store.caselistData = defaultCaselistData;
	});

	afterEach(() => {
		updateRound.mockClear();
		loadRound.mockClear();
	});
});
