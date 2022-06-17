import React from 'react';
import { assert } from 'chai';

import { wrappedRender as render, screen, fireEvent, waitFor } from '../setupTests';
import { updateTeam } from '../helpers/api';

import TeamNotes from './TeamNotes';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn().mockImplementation(() => ({ caselist: 'testcaselist', school: 'testschool', team: 'testteam' })),
}));

describe('TeamNotes', () => {
    it('Renders and submits a team notes field', async () => {
        render(<TeamNotes teamData={{ notes: 'Default Notes' }} />);
        await waitFor(() => assert.isOk(screen.getByText(/Team Notes/), 'Team Notes exists'));

        assert.isNotOk(document.querySelector('textarea'), 'No notes input');
        fireEvent.click(document.querySelector('.shownotes'));
        await waitFor(() => assert.isOk(document.querySelector('textarea'), 'Notes input exists'));
        assert.strictEqual(document.querySelector('textarea').value, 'Default Notes', 'Correct default notes');
        fireEvent.change(document.querySelector('textarea'), { target: { value: 'Test Notes' } });
        await waitFor(() => assert.isOk(screen.getByText(/information is public/), 'Contact Info warning exists'));
        await waitFor(() => assert.isOk(document.querySelector('button.save'), 'Save button exists'));
        await waitFor(() => assert.isOk(document.querySelector('button.cancel'), 'Cancel button exists'));

        fireEvent.click(document.querySelector('button.save'));
        await waitFor(() => assert.strictEqual(updateTeam.mock.calls.length, 1, 'updateTeam called'));
        await waitFor(() => assert.isOk(screen.getByText(/Successfully updated team/), 'Success message exists'));
    });

    it('Handles cancelling the edit', async () => {
        render(<TeamNotes teamData={{ notes: 'Default Notes' }} />);
        await waitFor(() => assert.isOk(screen.getByText(/Team Notes/), 'Team Notes exists'));

        fireEvent.click(document.querySelector('.shownotes'));
        fireEvent.change(document.querySelector('textarea'), { target: { value: 'Test Notes' } });

        fireEvent.click(document.querySelector('button.cancel'));
        assert.strictEqual(document.querySelector('textarea').value, 'Default Notes', 'Reset input field to default');
    });

    it('Displays an error message on failure', async () => {
        updateTeam.mockRejectedValue({ message: 'Failed to update team' });

        render(<TeamNotes teamData={{ notes: 'Default Notes' }} />);

        fireEvent.click(document.querySelector('.shownotes'));
        fireEvent.change(document.querySelector('textarea'), { target: { value: 'Test Notes' } });
        fireEvent.click(document.querySelector('button.save'));
        await waitFor(() => assert.isOk(screen.getByText(/Failed to update team/), 'Failure message exists'));
    });

    afterEach(() => {
        updateTeam.mockReset();
    });
});
