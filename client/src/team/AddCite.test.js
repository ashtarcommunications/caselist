import React from 'react';
import { assert } from 'chai';

import { wrappedRender as render, screen, fireEvent, waitFor } from '../setupTests';

import AddCite from './AddCite';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn().mockImplementation(() => ({ caselist: 'testcaselist', school: 'testschool', team: 'testteam' })),
}));

describe('AddCite', () => {
    it('Renders and submits an add cite form', async () => {
        const mockHandleAddCite = jest.fn();
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
