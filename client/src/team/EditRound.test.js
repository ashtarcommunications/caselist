import React from 'react';
import { assert } from 'chai';
import { useNavigate } from 'react-router-dom';

import { wrappedRender as render, screen, fireEvent, waitFor } from '../setupTests';
import { loadRound, updateRound } from '../helpers/api';
// eslint-disable-next-line import/named
import { store } from '../helpers/store';

import EditRound from './EditRound';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn().mockImplementation(() => ({ caselist: 'testcaselist', school: 'testschool', team: 'testteam' })),
    useNavigate: jest.fn().mockImplementation(() => () => true),
}));

describe('EditRound', () => {
    it('Displays an error message on failure', async () => {
        updateRound.mockRejectedValue({ message: 'Failed to update round' });

        render(<EditRound />);
        await waitFor(() => assert.isNotOk(document.querySelector('.loader'), 'Loader disappears'));

        fireEvent.change(document.querySelector('input[name="tournament"]'), { target: { value: 'Update' } });
        await waitFor(() => assert.strictEqual(document.querySelector('input[name="tournament"]').value, 'Update', 'Correct tournament value'));

        const button = document.querySelector('button[type="submit"]');
        button.disabled = false;
        fireEvent.click(button);
        await waitFor(() => assert.isOk(screen.queryByText(/Failed to update round/), 'Failure notification exists'));
    });

    it('Renders and submits an edit round form', async () => {
        loadRound.mockImplementation(() => ({
            round_id: 1,
            tournament: 'Tournament',
            side: 'A',
            round: '1',
            judge: 'Judge',
            opponent: 'Opponent',
            report: 'Report',
            opensource: '/test.docx',
            video: 'Video',
        }));
        updateRound.mockResolvedValue({ message: 'Successfully updated round' });

        render(<EditRound />);
        await waitFor(() => assert.isOk(document.querySelector('.loader'), 'Loader exists'));
        await waitFor(() => assert.isNotOk(document.querySelector('.loader'), 'Loader disappears'));
        await waitFor(() => assert.strictEqual(loadRound.mock.calls.length, 1, 'Called loadRound'));

        await waitFor(() => assert.strictEqual(document.querySelector('input[name="tournament"]').value, 'Tournament', 'Correct tournament'));
        assert.strictEqual(document.querySelector('#side').value, 'A', 'Correct side');
        assert.strictEqual(document.querySelector('#round').value, '1', 'Correct round');
        assert.strictEqual(document.querySelector('input[name="opponent"]').value, 'Opponent', 'Correct opponent');
        assert.strictEqual(document.querySelector('input[name="judge"]').value, 'Judge', 'Correct judge');
        assert.strictEqual(document.querySelector('textarea[name="report"]').value, 'Report', 'Correct report');
        assert.strictEqual(document.querySelector('input[name="video"]').value, 'Video', 'Correct video');
        await waitFor(() => assert.isOk(screen.queryByText(/test.docx/), 'Correct open source'));
        await waitFor(() => assert.isOk(document.querySelector('.trash'), 'Delete icon exists'));
        fireEvent.click(document.querySelector('.trash'));
        await waitFor(() => assert.isNotOk(screen.queryByText(/test.docx/), 'Removed open source'));

        const button = document.querySelector('button[type="submit"]');
        button.disabled = false;
        fireEvent.click(button);
        await waitFor(() => assert.isOk(screen.queryByText('Successfully updated round'), 'Success notification exists'));
        await waitFor(() => assert.strictEqual(updateRound.mock.calls.length, 1, 'Called updateRound'));
        await waitFor(() => assert.strictEqual(document.querySelector('input[name="tournament"]').value, '', 'Tournament reset'));
    });

    it('Renders an error message for an archived caselist', async () => {
        store.caselistData.archived = true;
        render(<EditRound />);
        await waitFor(() => assert.isOk(screen.queryByText(/caselist is archived/), 'Error message exists'));
        store.caselistData.archived = false;
    });

    it('Renders an error message without caselistData', async () => {
        const defaultCaselistData = store.caselistData;
        store.caselistData = { message: 'No caselistData' };
        render(<EditRound />);
        await waitFor(() => assert.isOk(screen.queryAllByText('No caselistData'), 'Error message exists'));
        store.caselistData = defaultCaselistData;
    });

    afterEach(() => {
        updateRound.mockReset();
        loadRound.mockReset();
        useNavigate.mockReset();
    });
});
