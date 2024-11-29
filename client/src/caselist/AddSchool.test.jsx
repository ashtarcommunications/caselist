import React from 'react';
import { assert } from 'vitest';

import {
	wrappedRender as render,
	screen,
	fireEvent,
	waitFor,
} from '../setupTests';
import { loadTabroomChapters, addSchool } from '../helpers/api.js';
import { store } from '../helpers/store';
import { auth } from '../helpers/auth';

import AddSchool from './AddSchool';

describe('AddSchool', () => {
	it('Renders and submits an add school form', async () => {
		render(<AddSchool />, {
			route: '/:caselist/add',
			path: '/testcaselist/add',
		});
		await waitFor(() =>
			assert.isOk(
				screen.queryByText('Create a school on Test Caselist'),
				'Heading exists',
			),
		);
		await waitFor(() =>
			assert.isOk(screen.queryByText('School Name'), 'State input exists'),
		);
		await waitFor(() =>
			assert.isOk(screen.queryByText('State'), 'State input exists'),
		);

		await waitFor(() =>
			assert.isOk(
				document.querySelector('.rw-picker-btn'),
				'Combobox dropdown appears',
			),
		);

		fireEvent.click(document.querySelector('.rw-picker-btn'));

		await waitFor(() =>
			assert.isOk(
				screen.queryByText('Tabroom School'),
				'Tabroom chapter is in the dropdown',
			),
		);

		// Check form accepts inputs
		const schoolName = document.querySelector('input');
		fireEvent.change(schoolName, { target: { value: 'Test School' } });
		assert.strictEqual(
			schoolName.value,
			'Test School',
			'Correct School Name input value',
		);

		const state = document.querySelector('select');
		fireEvent.change(state, { target: { value: 'CO' } });
		assert.strictEqual(state.value, 'CO', 'Correct State select value');

		// Submit form - have to manually disable button because of react-hook-form
		const button = screen.getByRole('button', { name: 'Create New School' });
		button.disabled = false;
		fireEvent.click(button);
		await waitFor(() =>
			assert.strictEqual(addSchool.mock.calls.length, 1, 'Submitted the form'),
		);
		assert.strictEqual(
			store.fetchSchools.mock.calls.length,
			1,
			'Refetched schools',
		);
		await waitFor(() =>
			assert.isOk(
				screen.queryByText('Successfully added school'),
				'Success notification exists',
			),
		);
	});

	it('Displays warnings for school name', async () => {
		render(<AddSchool />, {
			route: '/:caselist/add',
			path: '/testcaselist/add',
		});

		const schoolName = document.querySelector('input');
		fireEvent.change(schoolName, { target: { value: 'Test school' } });
		await waitFor(() =>
			assert.isOk(
				screen.queryByText(/School name should be title case/),
				'Title case warning exists',
			),
		);
	});

	it('Displays an error message on failure', async () => {
		addSchool.mockRejectedValue({ message: 'Failed to create school' });

		render(<AddSchool />, {
			route: '/:caselist/add',
			path: '/testcaselist/add',
		});
		await waitFor(() =>
			assert.isOk(
				screen.queryByText('Create a school on Test Caselist'),
				'Heading exists',
			),
		);

		fireEvent.change(document.querySelector('input'), {
			target: { value: 'Test School' },
		});
		fireEvent.change(document.querySelector('select'), {
			target: { value: 'CO' },
		});

		const button = screen.getByRole('button', { name: 'Create New School' });
		button.disabled = false;
		fireEvent.click(button);
		await waitFor(() =>
			assert.isOk(
				screen.queryByText(/Failed to add school/),
				'Failure notification exists',
			),
		);
	});

	it('Renders an error message without caselistData', async () => {
		const defaultCaselistData = store.caselistData;
		store.caselistData = { message: 'No caselistData' };
		render(<AddSchool />, {
			route: '/:caselist/add',
			path: '/testcaselist/add',
		});
		await waitFor(() =>
			assert.isOk(
				screen.queryAllByText('No caselistData'),
				'Error message exists',
			),
		);
		store.caselistData = defaultCaselistData;
	});

	it('Renders an untrusted message without a trusted user', async () => {
		auth.user.trusted = false;
		render(<AddSchool />, {
			route: '/:caselist/add',
			path: '/testcaselist/add',
		});
		await waitFor(() =>
			assert.isOk(
				screen.queryAllByText('Account Untrusted'),
				'Untrusted message exists',
			),
		);
		auth.user.trusted = true;
	});

	it('Handles failure to fetch Tabroom chapters', async () => {
		loadTabroomChapters.mockRejectedValue(() => {
			throw new Error('Failed to fetch Tabroom chapters');
		});
		render(<AddSchool />, {
			route: '/:caselist/add',
			path: '/testcaselist/add',
		});
		assert.strictEqual(
			loadTabroomChapters.mock.calls.length,
			1,
			'Attempted to fetch Tabroom chapters',
		);
		await waitFor(() =>
			assert.isOk(
				screen.queryByText('Create a school on Test Caselist'),
				'Heading exists',
			),
		);
	});

	afterEach(() => {
		loadTabroomChapters.mockClear();
		addSchool.mockClear();
	});
});
