import React from 'react';
import { assert } from 'vitest';

import { wrappedRender as render, screen, waitFor } from '../setupTests';
import Untrusted from './Untrusted';

describe('Untrusted', () => {
	it('Renders an untrusted message', async () => {
		render(<Untrusted />);

		await waitFor(() =>
			assert.isOk(screen.queryByText('Account Untrusted'), 'Message exists'),
		);
	});
});
