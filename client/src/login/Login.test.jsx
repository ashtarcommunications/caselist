import React from 'react';
import { assert } from 'chai';
import { useNavigate } from 'react-router-dom';
import { vi } from 'vitest';

import { wrappedRender as render, screen, fireEvent, waitFor } from '../setupTests';
// eslint-disable-next-line import/named
import { auth } from '../helpers/auth';

import Login from './Login';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn().mockImplementation(() => () => true),
        uselocation: vi.fn().mockImplementation(() => ({ pathname: 'openev' })),
    };
});

describe('Login', () => {
    it('Renders and submits a login form', async () => {
        render(<Login />);
        assert.isOk(screen.queryAllByText(/Login/), 'Form exists');
        assert.isOk(screen.queryByText(/Forgot/), 'Forgot link exists');
        assert.isOk(screen.queryByText(/Register/), 'Register link exists');

        const username = document.querySelector('#username');
        fireEvent.change(username, { target: { value: 'test@test.com' } });
        assert.strictEqual(username.value, 'test@test.com', 'Correct Username input value');

        const password = document.querySelector('#password');
        fireEvent.change(password, { target: { value: 'password' } });
        assert.strictEqual(password.value, 'password', 'Correct Password input value');

        const remember = document.querySelector('#remember');
        fireEvent.change(remember);
        assert.strictEqual(remember.checked, true, 'Correct Remember input value');

        const button = screen.getByRole('button');
        button.disabled = false;
        fireEvent.click(button);
        await waitFor(() => assert.strictEqual(auth.handleLogin.mock.calls.length, 1, 'Submitted the form'));
        await waitFor(() => assert.isAtLeast(useNavigate.mock.calls.length, 1, 'Navigated to next page'));
    });

    it('Displays an error message on failure', async () => {
        auth.handleLogin.mockRejectedValue({ message: 'Failed to login' });

        render(<Login />);

        fireEvent.change(document.querySelector('#username'), { target: { value: 'test@test.com' } });
        fireEvent.change(document.querySelector('#password'), { target: { value: 'password' } });

        const button = screen.getByRole('button');
        button.disabled = false;
        fireEvent.click(button);
        await waitFor(() => assert.isOk(screen.queryByText(/Failed to login/), 'Failure notification exists'));
    });

    afterEach(() => {
        auth.handleLogin.mockClear();
        useNavigate.mockClear();
    });
});
