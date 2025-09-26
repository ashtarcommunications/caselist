import React from 'react';
import { assert, vi } from 'vitest';

import { wrappedRender as render, screen, fireEvent } from '../setupTests';

import { auth } from '../helpers/auth';

import CitesTable from './CitesTable';

describe('CitesTable', () => {
	it('Renders a cites table', async () => {
		const mockHandleDeleteCiteConfirm = vi.fn();
		const mockHandleToggleCites = vi.fn();
		render(
			<CitesTable
				event="cx"
				cites={[
					{
						cite_id: 1,
						title: 'Title',
						cites: 'Cite Content',
						tournament: 'Tournament',
						side: 'A',
						round: '1',
						opponent: 'Opponent',
						judge: 'Judge',
						citesopen: true,
					},
				]}
				handleDeleteCiteConfirm={mockHandleDeleteCiteConfirm}
				handleToggleCites={mockHandleToggleCites}
			/>,
		);
		assert.isOk(screen.queryByText(/Title/), 'Cite title exists');
		assert.isOk(screen.queryByTestId('calendar'), 'Calendar sort exists');
		assert.isOk(screen.queryByText(/Cite Content/), 'Cite content exists');

		fireEvent.click(screen.queryByText(/Title/));
		assert.strictEqual(
			mockHandleToggleCites.mock.calls.length,
			1,
			'handleToggleCites called',
		);

		fireEvent.click(screen.queryByTestId('copy'));
		assert.strictEqual(
			global.navigator.clipboard.writeText.mock.calls.length,
			1,
			'handleCopyCites called',
		);

		fireEvent.click(screen.queryByTestId('trash-cite'));
		assert.strictEqual(
			mockHandleDeleteCiteConfirm.mock.calls.length,
			1,
			'handleDeleteCiteConfirm called',
		);

		global.navigator.clipboard.writeText.mockReset();
	});

	it('should render nothing without cites', async () => {
		const mockHandleDeleteCiteConfirm = vi.fn();
		const mockHandleToggleCites = vi.fn();
		const view = render(
			<CitesTable
				cites={[]}
				handleDeleteCiteConfirm={mockHandleDeleteCiteConfirm}
				handleToggleCites={mockHandleToggleCites}
			/>,
		);
		assert.isNotOk(view.firstChild, 'Renders nothing');
	});

	it('Should not render a delete icon for untrusted users', async () => {
		auth.user.trusted = false;
		auth.user.admin = false;
		const mockHandleDeleteCiteConfirm = vi.fn();
		const mockHandleToggleCites = vi.fn();
		render(
			<CitesTable
				cites={[
					{
						cite_id: 1,
						title: 'Title',
						cites: 'Cites',
						tournament: 'Tournament',
						side: 'A',
						round: '1',
						opponent: 'Opponent',
						judge: 'Judge',
						citesopen: true,
					},
				]}
				handleDeleteCiteConfirm={mockHandleDeleteCiteConfirm}
				handleToggleCites={mockHandleToggleCites}
			/>,
		);
		assert.isNotOk(screen.queryByTestId('trash-cite'), 'No delete icon');
		auth.user.trusted = true;
		auth.user.admin = true;
	});

	it('should not render a delete icon for archived caselists', async () => {
		auth.user.admin = false;
		const mockHandleDeleteCiteConfirm = vi.fn();
		const mockHandleToggleCites = vi.fn();
		render(
			<CitesTable
				archived
				cites={[
					{
						cite_id: 1,
						title: 'Title',
						cites: 'Cites',
						tournament: 'Tournament',
						side: 'A',
						round: '1',
						opponent: 'Opponent',
						judge: 'Judge',
						citesopen: true,
					},
				]}
				handleDeleteCiteConfirm={mockHandleDeleteCiteConfirm}
				handleToggleCites={mockHandleToggleCites}
			/>,
		);
		assert.isNotOk(screen.queryByTestId('trash-cite'), 'No delete icon');
		auth.user.admin = true;
	});
});
