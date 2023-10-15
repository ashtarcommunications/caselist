import React from 'react';
import { assert } from 'chai';
import { useNavigate } from 'react-router-dom';
import { vi } from 'vitest';

import { wrappedRender as render, screen, fireEvent, waitFor } from '../setupTests';
import Error from './Error';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(() => () => true),
    };
});

describe('Error', () => {
    it('Renders an error page', async () => {
        render(<Error statusCode={400} message="Test Error" />);
        await waitFor(() => assert.isOk(screen.queryByText('Error 400'), 'Correct error code'));
        await waitFor(() => assert.isOk(screen.queryByText('Test Error'), 'Correct error message'));

        fireEvent.click(screen.queryByText('Back'));
        assert.strictEqual(useNavigate.mock.calls.length, 1, 'Called useNavigate');
    });

    it('Renders a 404', async () => {
        render(<Error is404 />);
        await waitFor(() => assert.isOk(screen.queryByText('Error 404'), 'Correct error code'));
    });
});
