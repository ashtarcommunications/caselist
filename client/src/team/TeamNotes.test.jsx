import React from 'react';
import { assert } from 'chai';
import { vi } from 'vitest';

import { wrappedRender as render, screen, fireEvent, waitFor } from '../setupTests';
import { updateTeam } from '../helpers/api';

import TeamNotes from './TeamNotes';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: vi.fn().mockImplementation(() => ({ caselist: 'testcaselist', school: 'testschool', team: 'testteam' })),
    };
});

describe('TeamNotes', () => {
    it('Renders and submits a team notes field', async () => {
        render(<TeamNotes teamData={{ notes: 'Default Notes' }} />);
        await waitFor(() => assert.isOk(screen.getByText(/Team Notes/), 'Team Notes exists'));

        assert.isNotOk(document.querySelector('textarea'), 'No notes input');
        fireEvent.click(screen.queryByTestId('shownotes'));
        await waitFor(() => assert.isOk(document.querySelector('textarea'), 'Notes input exists'));
        assert.strictEqual(document.querySelector('textarea').value, 'Default Notes', 'Correct default notes');
        fireEvent.change(document.querySelector('textarea'), { target: { value: 'Test Notes' } });
        await waitFor(() => assert.isOk(screen.getByText(/information is public/), 'Contact Info warning exists'));
        await waitFor(() => assert.isOk(screen.queryByText(/Save/), 'Save button exists'));
        await waitFor(() => assert.isOk(screen.queryByText(/Cancel/), 'Cancel button exists'));

        fireEvent.click(screen.queryByText(/Save/));
        await waitFor(() => assert.strictEqual(updateTeam.mock.calls.length, 1, 'updateTeam called'));
        await waitFor(() => assert.isOk(screen.getByText(/Successfully updated team/), 'Success message exists'));
    });

    it('Handles cancelling the edit', async () => {
        render(<TeamNotes teamData={{ notes: 'Default Notes' }} />);
        await waitFor(() => assert.isOk(screen.getByText(/Team Notes/), 'Team Notes exists'));

        fireEvent.click(screen.queryByTestId('shownotes'));
        fireEvent.change(document.querySelector('textarea'), { target: { value: 'Test Notes' } });

        fireEvent.click(screen.queryByText(/Cancel/));
        assert.strictEqual(document.querySelector('textarea').value, 'Default Notes', 'Reset input field to default');
    });

    it('Displays an error message on failure', async () => {
        updateTeam.mockRejectedValue({ message: 'Failed to update team' });

        render(<TeamNotes teamData={{ notes: 'Default Notes' }} />);

        fireEvent.click(screen.queryByTestId('shownotes'));
        fireEvent.change(document.querySelector('textarea'), { target: { value: 'Test Notes' } });
        fireEvent.click(screen.queryByText(/Save/));
        await waitFor(() => assert.isOk(screen.getByText(/Failed to update team/), 'Failure message exists'));
    });

    afterEach(() => {
        updateTeam.mockClear();
    });
});
