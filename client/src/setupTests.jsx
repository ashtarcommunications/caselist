/* istanbul disable file */
import React from 'react';
import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { ToastContainer } from 'react-toastify';
import { Router, Route } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';

import { ProvideAuth } from './helpers/auth';
import { ProvideStore } from './helpers/store';

vi.mock('./helpers/auth');
vi.mock('./helpers/store');
vi.mock('./helpers/api.js');
vi.mock('./helpers/useScript.js');

global.window.scrollTo = () => true;
global.window.URL.createObjectURL = () => '';
global.navigator.clipboard = {};
global.navigator.clipboard.writeText = vi.fn();

export let router;

export const wrappedRender = (component, options = {}) => {
	router = memoryLocation({ path: options.path, record: true });
	return render(
		<ProvideAuth>
			<ProvideStore>
				<Router hook={router.hook} searchHook={router.searchHook}>
					<Route path={options.route}>{component}</Route>
				</Router>
			</ProvideStore>
			<ToastContainer />
		</ProvideAuth>,
	);
};

export * from '@testing-library/react';

export default null;
