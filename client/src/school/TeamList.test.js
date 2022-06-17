import React from 'react';
import { assert } from 'chai';

import { wrappedRender as render, screen, fireEvent, waitFor } from '../setupTests';
// eslint-disable-next-line import/named
import { store } from '../helpers/store';
import { deleteTeam } from '../helpers/api';

import TeamList from './TeamList';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn().mockImplementation(() => ({ caselist: 'testcaselist', school: 'testschool', team: 'testteam' })),
}));

describe('TeamList', () => {
    it('Renders a team list', async () => {
        render(<TeamList />);
        await waitFor(() => assert.strictEqual(store.fetchTeams.mock.calls.length, 1, 'Fetched teams'));

        assert.isOk(screen.queryByText(/Test Team/), 'Display name   exists');
        assert.isOk(screen.queryByText(/Aff/), 'Aff link exists');
        assert.isOk(screen.queryByText(/Neg/), 'Neg link exists');
        assert.isOk(screen.queryByText(/updated by/), 'Updated By exists');

        const trash = document.querySelector('.trash');
        assert.isOk(trash, 'Trash button exists');
        fireEvent.click(trash);

        await waitFor(() => assert.isOk(screen.queryAllByText(/Are you sure/), 'Confirm prompt'));
        await waitFor(() => assert.isOk(document.querySelector('input.confirm'), 'Confirm input'));
        fireEvent.change(document.querySelector('input.confirm'), { target: { value: 'I am certain' } });
        const confirm = document.querySelector('button[name="confirm"]');
        confirm.disabled = false;
        fireEvent.click(confirm);
        await waitFor(() => assert.isOk(screen.queryAllByText(/Successfully deleted team/), 'Success message'));

        await waitFor(() => assert.strictEqual(deleteTeam.mock.calls.length, 1, 'Deleted team'));
        await waitFor(() => assert.strictEqual(store.fetchTeams.mock.calls.length, 2, 'Fetched teams'));
    });

    it('Renders an error message without caselistData', async () => {
        const defaultCaselistData = store.caselistData;
        store.caselistData = { message: 'No caselistData' };
        render(<TeamList />);
        await waitFor(() => assert.isOk(screen.queryAllByText('No caselistData'), 'Error message exists'));
        store.caselistData = defaultCaselistData;
    });

    afterEach(() => {
        deleteTeam.mockClear();
        store.fetchTeams.mockClear();
    });
});
