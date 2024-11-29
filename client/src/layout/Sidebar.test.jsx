import React from 'react';
import { assert } from 'vitest';

import { wrappedRender as render, screen, fireEvent } from '../setupTests';
import { store } from '../helpers/store';
import { auth } from '../helpers/auth';
import Sidebar from './Sidebar';

describe('Sidebar', () => {
	it('Renders a sidebar', async () => {
		render(<Sidebar />, {
			route: '/:caselist/:school/:team',
			path: '/testcaselist/testschool/testteam',
		});

		await screen.findByText(/Choose a Caselist/);
		await screen.findByText(/Test Caselist/);
		await screen.findByText(/Colorado/);
		assert.isOk(document.querySelector('select'), 'Dropdown exists');
		assert.isOk(document.querySelector('input'), 'Filter exists');
		assert.isOk(screen.queryByText(/Schools/), 'Schools heading exists');
		assert.isOk(screen.queryByText(/Test School/), 'School Links exist');
		assert.isOk(screen.queryByText(/Create/), 'Add button exists');
		assert.isOk(screen.queryByText(/Recently Modified/), 'Recent link exists');
		assert.isOk(screen.queryByText(/Bulk Downloads/), 'Downloads link exists');
	});

	it('Should not render a create button for an untrusted user', async () => {
		auth.user.trusted = false;
		render(<Sidebar />, {
			route: '/:caselist/:school/:team',
			path: '/testcaselist/testschool/testteam',
		});

		assert.isNotOk(screen.queryByText(/Create/), 'Add button does not exist');
		auth.user.trusted = true;
	});

	it('Returns false without caselist data', async () => {
		const defaultCaselistData = store.caselistData;
		store.caselistData = { message: 'No caselistData' };
		render(<Sidebar />, {
			route: '/:caselist/:school/:team',
			path: '/testcaselist/testschool/testteam',
		});
		const caselist = screen.queryByText(/Choose a Caselist/);
		assert.isNotOk(caselist);
		store.caselistData = defaultCaselistData;
	});

	it('Toggles sidebar visibility', async () => {
		render(<Sidebar />, {
			route: '/:caselist/:school/:team',
			path: '/testcaselist/testschool/testteam',
		});

		await screen.findByText(/Choose a Caselist/);
		await screen.findByText(/Test Caselist/);

		const collapse = await screen.findByText(/«/);
		fireEvent.click(collapse);
		await screen.findByText(/»/);
	});

	it('Shows an archive message', async () => {
		const defaultCaselistData = store.caselistData;
		store.caselistData = { archived: true };
		render(<Sidebar />, {
			route: '/:caselist/:school/:team',
			path: '/testcaselist/testschool/testteam',
		});
		await screen.findByText(/Choose a Caselist/);
		await screen.findByText(/Test Caselist/);
		assert.isOk(screen.queryByText(/archived/));
		store.caselistData = defaultCaselistData;
	});
});
