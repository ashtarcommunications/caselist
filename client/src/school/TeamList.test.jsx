import React from 'react';
import { assert } from 'vitest';

import {
	wrappedRender as render,
	screen,
	fireEvent,
	waitFor,
} from '../setupTests';
import { store } from '../helpers/store';
import { auth } from '../helpers/auth';
import { deleteTeam } from '../helpers/api.js';

import TeamList from './TeamList';

describe('TeamList', () => {
	it('Renders a team list', async () => {
		render(<TeamList />, {
			route: '/:caselist/:school/:team',
			path: '/testcaselist/testschool/testteam',
		});
		await waitFor(() =>
			assert.strictEqual(
				store.fetchTeams.mock.calls.length,
				1,
				'Fetched teams',
			),
		);

		assert.isOk(screen.queryByText(/Test Team/), 'Display name exists');
		assert.isOk(screen.queryByText(/Aff/), 'Aff link exists');
		assert.isOk(screen.queryByText(/Neg/), 'Neg link exists');
		assert.isOk(screen.queryByText(/updated by/), 'Updated By exists');

		const trash = await screen.findByTestId('trash');
		assert.isOk(trash, 'Trash button exists');
		fireEvent.click(trash);

		await waitFor(() =>
			assert.isOk(screen.queryAllByText(/Are you sure/), 'Confirm prompt'),
		);
		await waitFor(() =>
			assert.isOk(screen.queryByTestId('confirm'), 'Confirm input'),
		);
		fireEvent.change(screen.queryByTestId('confirm'), {
			target: { value: 'I am certain' },
		});
		const confirm = document.querySelector('button[name="confirm"]');
		confirm.disabled = false;
		fireEvent.click(confirm);
		await waitFor(() =>
			assert.isOk(
				screen.queryAllByText(/Successfully deleted team/),
				'Success message',
			),
		);

		await waitFor(() =>
			assert.strictEqual(deleteTeam.mock.calls.length, 1, 'Deleted team'),
		);
		await waitFor(() =>
			assert.strictEqual(
				store.fetchTeams.mock.calls.length,
				2,
				'Fetched teams',
			),
		);
	});

	it('Optionally renders a school history', async () => {
		render(<TeamList />, {
			route: '/:caselist/:school/:team',
			path: '/testcaselist/testschool/testteam',
		});

		const toggle = await screen.findByTestId('showhistory');
		assert.isOk(toggle, 'Heading exists');
		fireEvent.click(toggle);

		await waitFor(() =>
			assert.isOk(
				screen.queryByText(/Test school history/),
				'Shows history table',
			),
		);
		fireEvent.click(toggle);
		await waitFor(() =>
			assert.isNotOk(
				screen.queryByText(/Test school history/),
				'Hides history table',
			),
		);
	});

	it('should not render a school history on an archived caselist', async () => {
		store.caselistData.archived = true;
		render(<TeamList />, {
			route: '/:caselist/:school/:team',
			path: '/testcaselist/testschool/testteam',
		});
		await waitFor(() =>
			assert.isNotOk(screen.queryByText(/School History/), 'No school history'),
		);
		store.caselistData.archived = false;
	});

	it('Renders an error message without caselistData', async () => {
		const defaultCaselistData = store.caselistData;
		store.caselistData = { message: 'No caselistData' };
		render(<TeamList />, {
			route: '/:caselist/:school/:team',
			path: '/testcaselist/testschool/testteam',
		});
		await waitFor(() =>
			assert.isOk(
				screen.queryAllByText('No caselistData'),
				'Error message exists',
			),
		);
		store.caselistData = defaultCaselistData;
	});

	it('Does not render trash icons without a trusted user', async () => {
		auth.user.trusted = false;
		auth.user.admin = false;
		render(<TeamList />, {
			route: '/:caselist/:school/:team',
			path: '/testcaselist/testschool/testteam',
		});
		await waitFor(() =>
			assert.strictEqual(
				store.fetchTeams.mock.calls.length,
				1,
				'Fetched teams',
			),
		);

		assert.isNotOk(screen.queryByTestId('trash'), 'No delete icon');
		auth.user.trusted = true;
		auth.user.admin = true;
	});

	afterEach(() => {
		deleteTeam.mockClear();
		store.fetchTeams.mockClear();
	});
});
