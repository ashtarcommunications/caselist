import React from 'react';
import { render } from '@testing-library/react';
import { assert, vi } from 'vitest';

import App from './App';

vi.mock('@uiw/react-md-editor', async () => {
	return {
		default: vi.fn().mockImplementation(() => <textarea />),
		commands: vi.fn().mockImplementation(() => false),
	};
});

describe('App', () => {
	it('Renders the app without crashing', () => {
		render(<App />);
		assert.isOk(document.querySelector('body'), 'Renders the root div');
	});
});
