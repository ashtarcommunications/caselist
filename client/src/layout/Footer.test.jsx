import React from 'react';
import { assert } from 'vitest';

import { wrappedRender as render, screen, waitFor } from '../setupTests';
import Footer from './Footer';

describe('Footer', () => {
	it('Renders a footer', async () => {
		render(<Footer />);

		await waitFor(() =>
			assert.isOk(document.querySelector('svg'), 'UFO icon exists'),
		);
		await waitFor(() =>
			assert.isOk(screen.queryByText('Contact'), 'Links exist'),
		);
	});
});
