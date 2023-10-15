import React from 'react';
import { assert } from 'chai';
import { vi } from 'vitest';

import { wrappedRender as render, waitFor } from '../setupTests';
// eslint-disable-next-line import/named
import { auth } from '../helpers/auth';

import Logout from './Logout';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn().mockImplementation(() => () => true),
        Navigate: () => true,
    };
});

describe('Logout', () => {
    it('Logs out the user', async () => {
        render(<Logout />);
        await waitFor(() => assert.strictEqual(auth.handleLogout.mock.calls.length, 1, 'Logged out'));
    });

    afterEach(() => {
        auth.handleLogout.mockClear();
    });
});
