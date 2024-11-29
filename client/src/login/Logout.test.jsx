import React from 'react';
import { assert } from 'vitest';

import { wrappedRender as render, waitFor } from '../setupTests';
import { auth } from '../helpers/auth';

import Logout from './Logout';

describe('Logout', () => {
	it('Logs out the user', async () => {
		render(<Logout />);
		await waitFor(() =>
			assert.strictEqual(auth.handleLogout.mock.calls.length, 1, 'Logged out'),
		);
	});

	afterEach(() => {
		auth.handleLogout.mockClear();
	});
});
