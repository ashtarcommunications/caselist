import React from 'react';
import { assert } from 'vitest';

import { wrappedRender as render, screen, waitFor } from '../setupTests';
import { auth } from '../helpers/auth';
import Layout from './Layout';

describe('Layout', () => {
	it('Renders a layout', async () => {
		render(
			<Layout>
				<p>Test</p>
			</Layout>,
		);

		await waitFor(() =>
			assert.isOk(document.querySelector('header'), 'Header exists'),
		);
		await waitFor(() =>
			assert.isOk(document.querySelector('div'), 'Wrapper div exists'),
		);
		await waitFor(() =>
			assert.isOk(document.querySelector('footer'), 'Footer exists'),
		);
		await waitFor(() =>
			assert.isOk(screen.queryByText(/Test/), 'Renders children'),
		);
	});

	it('Render a sidebar on private route', async () => {
		render(<Layout privateRoute />);

		await waitFor(() =>
			assert.isOk(screen.queryByText(/Schools/), 'Sidebar exists'),
		);
	});

	it('Render an openev sidebar', async () => {
		render(<Layout privateRoute openev />);

		await waitFor(() =>
			assert.isOk(
				screen.queryByText(/Files By Camp/),
				'Open Ev Sidebar exists',
			),
		);
	});

	it('Optionally suppress rendering a sidebar', async () => {
		render(<Layout suppressSidebar />);

		const sidebar = screen.queryByText(/Schools/);
		assert.isNull(sidebar, 'No sidebar rendered');
	});

	it('Does not render private route layout for non-logged-in users', async () => {
		auth.user.loggedIn = false;
		render(<Layout />);

		await waitFor(() =>
			assert.isNotOk(screen.queryByText(/Schools/), 'Sidebar exists'),
		);
		auth.user.loggedIn = true;
	});
});
