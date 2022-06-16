import React from 'react';
import { assert } from 'chai';
import { useNavigate } from 'react-router-dom';

import { wrappedRender as render, screen, fireEvent, waitFor } from '../setupTests';
import { loadTabroomRounds, addRound } from '../helpers/api';
// eslint-disable-next-line import/named
import { store } from '../helpers/store';

import AddRound from './AddRound';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn().mockImplementation(() => ({ caselist: 'testcaselist', school: 'testschool', team: 'testteam' })),
    useNavigate: jest.fn().mockImplementation(() => () => true),
}));

describe('AddRound', () => {
    it('Renders and submits an add round form', async () => {
        render(<AddRound />);
        await waitFor(() => assert.isOk(screen.queryByText(/Add a round/), 'Heading exists'));
        await waitFor(() => assert.isOk(document.querySelector('.rw-combobox-input'), 'Combobox dropdown appears'));
        fireEvent.focus(document.querySelector('.rw-combobox-input'));
        await waitFor(() => assert.strictEqual(loadTabroomRounds.mock.calls.length, 1, 'Called loadTabroomRounds'));
        await waitFor(() => assert.isOk(screen.queryByText(/Test Tournament/), 'Dropdown includes a Tabroom round'));

        const tournament = document.querySelector('#tournament_input');
        fireEvent.change(tournament, { target: { value: 'Tournament' } });
        assert.strictEqual(tournament.value, 'Tournament', 'Correct Tournament select value');
        const side = document.querySelector('#side');
        fireEvent.change(side, { target: { value: 'A' } });
        assert.strictEqual(side.value, 'A', 'Correct side value');
        const round = document.querySelector('#round');
        fireEvent.change(round, { target: { value: '1' } });
        assert.strictEqual(round.value, '1', 'Correct round value');
        const opponent = document.querySelector('input[name="opponent"]');
        fireEvent.change(opponent, { target: { value: 'Opponent' } });
        assert.strictEqual(opponent.value, 'Opponent', 'Correct opponent value');
        const judge = document.querySelector('input[name="judge"]');
        fireEvent.change(judge, { target: { value: 'Judge' } });
        assert.strictEqual(judge.value, 'Judge', 'Correct judge value');
        const report = document.querySelector('textarea[name="report"]');
        fireEvent.change(report, { target: { value: 'Report' } });
        assert.strictEqual(report.value, 'Report', 'Correct report value');
        const video = document.querySelector('input[name="video"]');
        fireEvent.change(video, { target: { value: 'https://video.com' } });
        assert.strictEqual(video.value, 'https://video.com', 'Correct video value');
        const autodetect = document.querySelector('input[type="checkbox"]');
        fireEvent.change(autodetect, { target: { value: 'no' } });
        assert.strictEqual(autodetect.value, 'no', 'Correct autodetect value');
        const title = document.querySelector('#cites\\.0\\.title');
        fireEvent.change(title, { target: { value: 'Title' } });
        assert.strictEqual(title.value, 'Title', 'Correct title value');

        await waitFor(() => assert.isOk(screen.queryByText(/Cite entries must have a title and contents/), 'Invalid cite warning'));

        const cites = document.querySelector('textarea.w-md-editor-text-input');
        fireEvent.change(cites, { target: { value: 'Test Cite' } });
        assert.strictEqual(cites.value, 'Test Cite', 'Correct cites value');

        const dropzone = document.querySelector('.dropzone input');
        const file = new File(['file'], 'test.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        Object.defineProperty(dropzone, 'files', { value: [file] });
        fireEvent.drop(dropzone);
        await waitFor(() => assert.isOk(dropzone.files, 'Dropzone has files'));
        await waitFor(() => assert.isNotOk(document.querySelector('.dropzone input'), 'Dropzone is gone'));

        await waitFor(() => assert.isOk(dropzone.files, 'Dropzone has files'));
        await waitFor(() => assert.isOk(screen.queryByText(/test.docx/), 'Uploaded file listed'));
        await waitFor(() => assert.isOk(screen.queryByText(/testschool-testteam-Aff-Tournament-Round-1.docx/), 'Uploaded file listed'));

        const button = document.querySelector('button[type="submit"]');
        button.disabled = false;
        fireEvent.click(button);
        await waitFor(() => assert.isOk(screen.queryByText('Successfully added round'), 'Success notification exists'));
        await waitFor(() => assert.strictEqual(addRound.mock.calls.length, 1, 'Called addRound'));
        await waitFor(() => assert.strictEqual(tournament.value, '', 'Tournament reset'));
        await waitFor(() => assert.isNotOk(screen.queryByText(/Test Cite/), 'Cites reset'));
    });

    it('Disables inputs for All Tournament', async () => {
        render(<AddRound />);

        const tournament = document.querySelector('#tournament_input');
        fireEvent.change(tournament, { target: { value: 'All Tournaments' } });
        await waitFor(() => assert.isTrue(document.querySelector('#round').disabled, 'Round disabled'));
        await waitFor(() => assert.isTrue(document.querySelector('input[name="opponent"]').disabled, 'Opponent disabled'));
        await waitFor(() => assert.isTrue(document.querySelector('input[name="judge"]').disabled, 'Judge disabled'));
        await waitFor(() => assert.isTrue(document.querySelector('textarea[name="report"]').disabled, 'Report disabled'));
        await waitFor(() => assert.isTrue(document.querySelector('input[name="video"]').disabled, 'Video disabled'));
    });

    it('Displays an error message on failure', async () => {
        addRound.mockRejectedValue({ message: 'Failed to create round' });

        render(<AddRound />);
        fireEvent.change(document.querySelector('#tournament_input'), { target: { value: 'Tournament' } });
        fireEvent.change(document.querySelector('#side'), { target: { value: 'A' } });
        fireEvent.change(document.querySelector('#round'), { target: { value: '1' } });
        fireEvent.change(document.querySelector('input[name="opponent"]'), { target: { value: 'Opponent' } });
        fireEvent.change(document.querySelector('input[name="judge"]'), { target: { value: 'Judge' } });

        const button = document.querySelector('button[type="submit"]');
        button.disabled = false;
        fireEvent.click(button);
        await waitFor(() => assert.isOk(screen.queryByText(/Failed to add round/), 'Failure notification exists'));
    });

    it('Renders an error message for an archived caselist', async () => {
        store.caselistData.archived = true;
        render(<AddRound />);
        await waitFor(() => assert.isOk(screen.queryByText(/caselist is archived/), 'Error message exists'));
        store.caselistData.archived = false;
    });

    it('Renders an error message without caselistData', async () => {
        const defaultCaselistData = store.caselistData;
        store.caselistData = { message: 'No caselistData' };
        render(<AddRound />);
        await waitFor(() => assert.isOk(screen.queryAllByText('No caselistData'), 'Error message exists'));
        store.caselistData = defaultCaselistData;
    });

    it('Handles failure to fetch Tabroom rounds', async () => {
        loadTabroomRounds.mockRejectedValue(() => { throw new Error('Failed to fetch Tabroom rounds'); });
        render(<AddRound />);
        await waitFor(() => assert.isOk(document.querySelector('.rw-combobox-input'), 'Combobox dropdown appears'));
        fireEvent.focus(document.querySelector('.rw-combobox-input'));
        await waitFor(() => assert.isOk(document.querySelector('.rw-combobox-input'), 'Combobox dropdown appears'));
    });

    afterEach(() => {
        loadTabroomRounds.mockReset();
        addRound.mockReset();
        useNavigate.mockReset();
    });
});
