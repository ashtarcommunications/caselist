import React from 'react';
import { assert } from 'vitest';
import { startOfYear } from '@speechanddebate/nsda-js-utils';

import {
	wrappedRender as render,
	screen,
	fireEvent,
	waitFor,
} from '../setupTests';
import { auth } from '../helpers/auth';
import { store } from '../helpers/store';
import { deleteOpenEvFile } from '../helpers/api.js';

import FilesTable from './FilesTable';

describe('FilesTable', () => {
	it('Renders a files table', async () => {
		const files = [
			{
				openev_id: 1,
				name: 'Test.docx',
				path: '/test',
				year: startOfYear(),
				camp: 'CNDI',
				tags: '{"da":true,"cp":true}',
			},
		];
		render(<FilesTable files={files} />);
		assert.isOk(screen.queryByText(/Test.docx/), 'File link exists');
		assert.isOk(screen.queryByText(/CNDI/), 'Camp column exists');
		assert.isOk(screen.queryByText(/Counterplans/), 'Tag column exists');

		const trash = screen.queryByText(/Delete/);
		assert.isOk(trash, 'Trash button exists');
		fireEvent.click(trash);
		await waitFor(() =>
			assert.isOk(screen.queryByText(/Confirm/), 'Confirm prompt exists'),
		);
		fireEvent.click(screen.queryByText(/Confirm/));
		await waitFor(() =>
			assert.strictEqual(
				deleteOpenEvFile.mock.calls.length,
				1,
				'Deleted openev files',
			),
		);
		await waitFor(() =>
			assert.strictEqual(
				store.fetchOpenEvFiles.mock.calls.length,
				1,
				'Fetched openev files',
			),
		);
	});

	it('Only renders delete icon for admins', async () => {
		const files = [
			{
				openev_id: 1,
				name: 'Test.docx',
				path: '/test',
				year: startOfYear(),
				camp: 'CNDI',
				tags: '{"da":true,"cp":true}',
			},
		];
		auth.user.admin = false;
		render(<FilesTable files={files} />);
		assert.isNotOk(
			document.querySelector('.trash'),
			'No Trash button exists for non-admin',
		);
		auth.user.admin = true;
	});

	afterEach(() => {
		deleteOpenEvFile.mockClear();
		store.fetchOpenEvFiles.mockClear();
	});
});
