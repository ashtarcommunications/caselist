import React from 'react';
import { assert } from 'vitest';

import {
	wrappedRender as render,
	screen,
	fireEvent,
	waitFor,
} from '../setupTests';
import Error from './Error';

describe('Error', () => {
	it('Renders an error page', async () => {
		render(<Error statusCode={400} message="Test Error" />, {
			route: '/error',
			path: '/error',
		});
		await waitFor(() =>
			assert.isOk(screen.queryByText('Error 400'), 'Correct error code'),
		);
		await waitFor(() =>
			assert.isOk(screen.queryByText('Test Error'), 'Correct error message'),
		);

		// Tests use an isolated router, so we can't actually test that we went back
		fireEvent.click(screen.queryByText('Back'));
	});

	it('Renders a 404', async () => {
		render(<Error is404 />);
		await waitFor(() =>
			assert.isOk(screen.queryByText('Error 404'), 'Correct error code'),
		);
	});
});
