import React from 'react';
import { assert, vi } from 'vitest';

import { wrappedRender as render, screen, waitFor } from '../setupTests';
import Markdown from './Markdown';

global.fetch = vi.fn(() =>
	Promise.resolve({ text: () => Promise.resolve('test') }),
);

describe('Markdown', () => {
	it('Renders a markdown component', async () => {
		render(<Markdown file="test" />);

		await waitFor(() =>
			assert.isOk(screen.queryByText('test'), 'Markdown exists'),
		);
	});
});
