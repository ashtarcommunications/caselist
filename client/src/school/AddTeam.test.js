import React from 'react';
import { assert } from 'chai';

import { wrappedRender as render, screen, fireEvent, waitFor } from '../setupTests';
import { loadTabroomStudents, addTeam } from '../helpers/api';
// eslint-disable-next-line import/named
import { store } from '../helpers/store';

import AddTeam from './AddTeam';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn().mockImplementation(() => ({ caselist: 'testcaselist', school: 'testschool', team: 'testteam' })),
}));

describe('AddTeam', () => {
    it('Renders and submits an add team form', async () => {
        render(<AddTeam />);
        await waitFor(() => assert.isOk(screen.queryByText(/Add a Team/), 'Heading exists'));
        await waitFor(() => assert.isOk(screen.queryByText('Debater #1 First'), 'Debater 1 First input exists'));
        await waitFor(() => assert.isOk(screen.queryByText('Debater #1 Last'), 'Debater 1 Last input exists'));
        await waitFor(() => assert.isOk(document.querySelector('.rw-combobox-input'), 'Combobox dropdown appears'));
        fireEvent.focus(document.querySelector('.rw-combobox-input'));
        await waitFor(() => assert.strictEqual(loadTabroomStudents.mock.calls.length, 1, 'Called loadTabroomStudents'));
        await waitFor(() => assert.isOk(screen.queryByText('Aaron Hardy'), 'Dropdown includes a Tabroom student'));

        let first = document.querySelector('#debater1_first_input');
        fireEvent.change(first, { target: { value: 'Aaron' } });
        assert.strictEqual(first.value, 'Aaron', 'Correct First select value');
        let last = document.querySelector('#debater1_last_input');
        fireEvent.change(last, { target: { value: 'Hardy' } });
        assert.strictEqual(last.value, 'Hardy', 'Correct Last select value');
        first = document.querySelector('#debater2_first_input');
        fireEvent.change(first, { target: { value: 'Aaron' } });
        assert.strictEqual(first.value, 'Aaron', 'Correct First select value');
        last = document.querySelector('#debater2_last_input');
        fireEvent.change(last, { target: { value: 'Hardy' } });
        assert.strictEqual(last.value, 'Hardy', 'Correct Last select value');

        const button = screen.getByRole('button', { name: 'Add' });
        button.disabled = false;
        fireEvent.click(button);
        await waitFor(() => assert.strictEqual(addTeam.mock.calls.length, 1, 'Called addTeam'));
        await waitFor(() => assert.strictEqual(store.fetchTeams.mock.calls.length, 1, 'Called fetchTeams'));
        await waitFor(() => assert.isOk(screen.queryByText('Successfully added team'), 'Success notification exists'));

        fireEvent.change(first, { target: { value: 'aaron' } });
        await waitFor(() => assert.isOk(screen.queryByText(/title case/), 'Title case warning exists'));

        fireEvent.change(first, { target: { value: 'aaron!!' } });
        await waitFor(() => assert.isOk(screen.queryByText(/Only letters/), 'Alphanumeric warning exists'));

        fireEvent.change(first, { target: { value: ' aaron' } });
        await waitFor(() => assert.isOk(screen.queryByText(/trailing spaces/), 'Trailing spaces warning exists'));
    });

    it('Displays an error message on failure', async () => {
        addTeam.mockRejectedValue({ message: 'Failed to create team' });

        render(<AddTeam />);

        fireEvent.change(document.querySelector('#debater1_first_input'), { target: { value: 'Aaron' } });
        fireEvent.change(document.querySelector('#debater1_last_input'), { target: { value: 'Aaron' } });
        fireEvent.change(document.querySelector('#debater2_first_input'), { target: { value: 'Aaron' } });
        fireEvent.change(document.querySelector('#debater2_last_input'), { target: { value: 'Aaron' } });

        const button = screen.getByRole('button', { name: 'Add' });
        button.disabled = false;
        fireEvent.click(button);
        await waitFor(() => assert.isOk(screen.queryByText(/Failed to add team/), 'Failure notification exists'));
    });

    it('Adds an All Teams team', async () => {
        render(<AddTeam />);
        const button = screen.queryByText(/All Teams/);
        fireEvent.click(button);
        await waitFor(() => assert.isOk(screen.queryAllByText(/Are you sure/), 'Confirm prompt'));
        await waitFor(() => assert.isOk(document.querySelector('button[name="confirm"'), 'Confirm prompt'));
        const confirm = document.querySelector('button[name="confirm"]');
        fireEvent.click(confirm);
        await waitFor(() => assert.strictEqual(addTeam.mock.calls.length, 1, 'Called addTeam'));
    });

    it('Adds an All Novices team', async () => {
        render(<AddTeam />);
        const button = screen.queryByText(/All Novices/);
        fireEvent.click(button);
        await waitFor(() => assert.isOk(screen.queryAllByText(/Are you sure/), 'Confirm prompt'));
        await waitFor(() => assert.isOk(document.querySelector('button[name="confirm"'), 'Confirm prompt'));
        const confirm = document.querySelector('button[name="confirm"]');
        fireEvent.click(confirm);
        await waitFor(() => assert.strictEqual(addTeam.mock.calls.length, 1, 'Called addTeam'));
    });

    it('Adds and removes students', async () => {
        render(<AddTeam />);
        const add = document.querySelector('.add-debater');
        fireEvent.click(add);
        await waitFor(() => assert.isOk(screen.queryAllByText(/Debater #3/), 'Added a debater'));

        await waitFor(() => assert.isOk(document.querySelector('.remove-debater'), 'Remove button appears'));
        const remove = document.querySelector('.remove-debater');
        fireEvent.click(remove);
        await waitFor(() => assert.isNull(screen.queryByText(/Debater #3/), 'Removed a debater'));
    });

    it('Renders an error message without caselistData', async () => {
        const defaultCaselistData = store.caselistData;
        store.caselistData = { message: 'No caselistData' };
        render(<AddTeam />);
        await waitFor(() => assert.isOk(screen.queryAllByText('No caselistData'), 'Error message exists'));
        store.caselistData = defaultCaselistData;
    });

    it('Handles failure to fetch Tabroom students', async () => {
        loadTabroomStudents.mockRejectedValue(() => { throw new Error('Failed to fetch Tabroom students'); });
        render(<AddTeam />);
        await waitFor(() => assert.isOk(document.querySelector('.rw-combobox-input'), 'Combobox dropdown appears'));
        fireEvent.focus(document.querySelector('.rw-combobox-input'));
        assert.strictEqual(loadTabroomStudents.mock.calls.length, 1, 'Attempted to fetch Tabroom students');
        await waitFor(() => assert.isOk(document.querySelector('.rw-combobox-input'), 'Combobox dropdown appears'));
    });

    afterEach(() => {
        loadTabroomStudents.mockClear();
        addTeam.mockClear();
        store.fetchTeams.mockClear();
    });
});
