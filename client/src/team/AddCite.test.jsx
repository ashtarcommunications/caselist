import React from 'react';
import { assert } from 'chai';
import { vi } from 'vitest';

import { wrappedRender as render, screen, fireEvent, waitFor } from '../setupTests';

import AddCite from './AddCite';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: vi.fn().mockImplementation(() => ({ caselist: 'testcaselist', school: 'testschool', team: 'testteam' })),
    };
});

vi.mock('@uiw/react-md-editor', async () => {
    return {
        default: vi.fn().mockImplementation(() => <textarea />),
        commands: vi.fn().mockImplementation(() => false),
    };
});

describe('AddCite', () => {
    it('Renders and submits an add cite form', async () => {
        const mockHandleAddCite = vi.fn();
        render(<AddCite event="cx" handleAddCite={mockHandleAddCite} rounds={[{ round_id: 1, tournament: 'All Tournaments', round: 'All', side: 'A' }]} />);

        // Toggle the form
        await waitFor(() => assert.isOk(screen.queryByText(/Add Cite/), 'Button exists'));
        fireEvent.click(screen.queryByRole('button'));
        await waitFor(() => assert.isOk(screen.queryByText(/Add cites/), 'Heading exists'));
        await waitFor(() => assert.isOk(screen.queryByText(/All Tournaments Aff/), 'Heading exists'));

        const select = document.querySelector('#selectround');
        fireEvent.change(select, { target: { value: '1' } });
        assert.strictEqual(select.value, '1', 'Correct round select value');

        await waitFor(() => assert.isOk(document.querySelector('textarea'), 'Cite entry exists'));

        const button = document.querySelector('button[type="submit"]');
        button.disabled = false;
        fireEvent.click(button);

        await waitFor(() => assert.strictEqual(mockHandleAddCite.mock.calls.length, 1, 'handleAddCite was called'));
        await waitFor(() => assert.isOk(screen.queryByText(/Add Cite/), 'Button exists'));
    });
});
