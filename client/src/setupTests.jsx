/* istanbul disable file */
import React from 'react';
import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { ProvideAuth } from './helpers/auth';
import { ProvideStore } from './helpers/store';

vi.mock('./helpers/auth');
vi.mock('./helpers/store');
vi.mock('./helpers/api');
vi.mock('./helpers/useScript');

global.window.scrollTo = () => true;
global.window.URL.createObjectURL = () => '';
global.navigator.clipboard = {};
global.navigator.clipboard.writeText = vi.fn();

export const wrappedRender = (component) => {
    return render(
        <ProvideAuth>
            <MemoryRouter initialEntries={['/?q=test']}>
                <ProvideStore>
                    {component}
                </ProvideStore>
            </MemoryRouter>
            <ToastContainer />
        </ProvideAuth>
    );
};

export * from '@testing-library/react';

export default null;
