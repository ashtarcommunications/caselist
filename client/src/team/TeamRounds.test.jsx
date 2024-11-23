import React from 'react';
import { assert } from 'chai';
import { useParams } from 'react-router-dom';
import { vi } from 'vitest';

import { wrappedRender as render, screen, fireEvent, waitFor } from '../setupTests';
// eslint-disable-next-line import/named
import { store } from '../helpers/store';
import { loadTeam, loadRounds, deleteRound, loadCites, deleteCite, addCite, addTabroomLink } from '../helpers/api';

import TeamRounds from './TeamRounds';

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

describe('TeamList', () => {
    it('Renders team rounds', async () => {
        render(<TeamRounds />);
        await waitFor(() => assert.strictEqual(loadTeam.mock.calls.length, 1, 'Fetched team'));
        await waitFor(() => assert.strictEqual(loadRounds.mock.calls.length, 1, 'Fetched rounds'));
        await waitFor(() => assert.strictEqual(loadCites.mock.calls.length, 1, 'Fetched cites'));

        assert.isOk(screen.queryByText(/Test Team \(Hardy\)/), 'Display name exists');
        assert.isOk(screen.queryByText(/Team Notes/), 'Team Notes exists');
        assert.isOk(screen.queryAllByText('All'), 'All side exists');
        assert.isOk(screen.queryAllByText('Aff'), 'Aff side exists');
        assert.isOk(screen.queryAllByText('Neg'), 'Neg side exists');
        assert.isOk(screen.queryByText(/updated by/), 'Updated By exists');
        assert.isOk(screen.queryByText(/Add Round/), 'Add Round button exists');
        assert.isOk(screen.queryByText(/Add Cite/), 'Add Cite button exists');
    });

    it('Handles deleting a round', async () => {
        render(<TeamRounds />);
        await waitFor(() => assert.strictEqual(loadTeam.mock.calls.length, 1, 'Fetched team'));
        await waitFor(() => assert.strictEqual(loadRounds.mock.calls.length, 1, 'Fetched rounds'));
        await waitFor(() => assert.strictEqual(loadCites.mock.calls.length, 1, 'Fetched cites'));

        const rounds = screen.queryAllByTestId('trash-round').length;

        fireEvent.click(screen.queryAllByTestId('trash-round')[0]);
        await waitFor(() => assert.isOk(screen.queryAllByText(/Are you sure/), 'Confirm prompt'));
        await waitFor(() => assert.isOk(screen.queryAllByText(/Confirm/), 'Confirm prompt'));
        const confirm = document.querySelector('button[name="confirm"]');
        confirm.disabled = false;
        fireEvent.click(confirm);
        await waitFor(() => assert.isOk(screen.queryByText(/Successfully deleted round/), 'Success message'));

        await waitFor(() => assert.strictEqual(deleteRound.mock.calls.length, 1, 'Deleted round'));
        await waitFor(() => assert.isOk(screen.getByText(/Aff Tournament/), 'Removed round from the table'));
        await waitFor(() => assert.strictEqual(screen.queryAllByTestId('trash-round').length, rounds - 1, 'Removed round from the table'));
    });

    it('Handles failing to delete a round', async () => {
        deleteRound.mockRejectedValue({ message: 'Failed to delete round' });

        render(<TeamRounds />);
        await waitFor(() => assert.strictEqual(loadTeam.mock.calls.length, 1, 'Fetched team'));
        await waitFor(() => assert.strictEqual(loadRounds.mock.calls.length, 1, 'Fetched rounds'));
        await waitFor(() => assert.strictEqual(loadCites.mock.calls.length, 1, 'Fetched cites'));

        fireEvent.click(screen.queryAllByTestId('trash-round')[0]);
        await waitFor(() => assert.isOk(screen.queryByText(/Are you sure/), 'Confirm prompt'));
        const confirm = document.querySelector('button[name="confirm"]');
        confirm.disabled = false;
        fireEvent.click(confirm);
        await waitFor(() => assert.isOk(screen.queryAllByText(/Failed to delete round/), 'Failure message'));
    });

    it('Handles toggling reports', async () => {
        render(<TeamRounds />);
        await waitFor(() => assert.strictEqual(loadTeam.mock.calls.length, 1, 'Fetched team'));
        await waitFor(() => assert.strictEqual(loadRounds.mock.calls.length, 1, 'Fetched rounds'));
        await waitFor(() => assert.strictEqual(loadCites.mock.calls.length, 1, 'Fetched cites'));

        await waitFor(() => assert.isOk(document.querySelector('div[class*="reportclosed"]'), 'Report is closed'));
        fireEvent.click(screen.queryAllByTestId('togglereport')[0]);
        await waitFor(() => assert.isOk(document.querySelector('div[class*="reportopen"]'), 'Report is closed'));

        fireEvent.click(screen.queryByTestId('toggleall'));
        await waitFor(() => assert.isNotOk(document.querySelector('div[class*="reportclosed"]'), 'Report is closed'));
    });

    it('Handles toggling cites', async () => {
        render(<TeamRounds />);
        await waitFor(() => assert.strictEqual(loadTeam.mock.calls.length, 1, 'Fetched team'));
        await waitFor(() => assert.strictEqual(loadRounds.mock.calls.length, 1, 'Fetched rounds'));
        await waitFor(() => assert.strictEqual(loadCites.mock.calls.length, 1, 'Fetched cites'));

        fireEvent.click(screen.queryByText(/Title/));
        await waitFor(() => assert.isOk(screen.queryAllByText(/Test Cites/), 'Toggles cites'));
    });

    it('Handles deleting a cite', async () => {
        render(<TeamRounds />);
        await waitFor(() => assert.strictEqual(loadTeam.mock.calls.length, 1, 'Fetched team'));
        await waitFor(() => assert.strictEqual(loadRounds.mock.calls.length, 1, 'Fetched rounds'));
        await waitFor(() => assert.strictEqual(loadCites.mock.calls.length, 1, 'Fetched cites'));

        fireEvent.click(screen.queryByTestId('trash-cite'));
        await waitFor(() => assert.isOk(screen.queryAllByText(/Are you sure/), 'Confirm prompt'));
        const confirm = document.querySelector('button[name="confirm"]');
        confirm.disabled = false;
        fireEvent.click(confirm);
        await waitFor(() => assert.isOk(screen.queryByText(/Successfully deleted cite/), 'Success message'));

        await waitFor(() => assert.strictEqual(deleteCite.mock.calls.length, 1, 'Deleted cite'));
        await waitFor(() => assert.isNotOk(document.querySelector('.cites-table'), 'No cite table after only cite removed'));
    });

    it('Handles failing to delete a cite', async () => {
        deleteCite.mockRejectedValue({ message: 'Failed to delete cite' });

        render(<TeamRounds />);
        await waitFor(() => assert.strictEqual(loadTeam.mock.calls.length, 1, 'Fetched team'));
        await waitFor(() => assert.strictEqual(loadRounds.mock.calls.length, 1, 'Fetched rounds'));
        await waitFor(() => assert.strictEqual(loadCites.mock.calls.length, 1, 'Fetched cites'));

        fireEvent.click(screen.queryByTestId('trash-cite'));
        await waitFor(() => assert.isOk(screen.queryByText(/Are you sure/), 'Confirm prompt'));
        const confirm = document.querySelector('button[name="confirm"]');
        confirm.disabled = false;
        fireEvent.click(confirm);
        await waitFor(() => assert.isOk(screen.queryByText(/Failed to delete cite/), 'Failure message'));
    });

    it('Handles adding a cite', async () => {
        render(<TeamRounds />);
        await waitFor(() => assert.strictEqual(loadTeam.mock.calls.length, 1, 'Fetched team'));
        await waitFor(() => assert.strictEqual(loadRounds.mock.calls.length, 1, 'Fetched rounds'));
        await waitFor(() => assert.strictEqual(loadCites.mock.calls.length, 1, 'Fetched cites'));
        await waitFor(() => assert.isOk(screen.queryByText(/Add Cite/), 'Add cite button exists'));

        // Toggle showing add cite form
        fireEvent.click(screen.queryByText(/Add Cite/));
        await waitFor(() => assert.isOk(screen.queryByText(/Add cites to/), 'Add cite form exists'));

        const select = document.querySelector('#selectround');
        fireEvent.change(select, { target: { value: '1' } });

        const button = screen.queryByText(/Add Cite/);
        button.disabled = false;
        fireEvent.click(button);
        await waitFor(() => assert.isOk(screen.queryByText(/Successfully added cite/), 'Success message'));
        await waitFor(() => assert.strictEqual(addCite.mock.calls.length, 1, 'Called addCite'));
    });

    it('Handles failure to add a cite', async () => {
        addCite.mockRejectedValue({ message: 'Failed to add cite' });

        render(<TeamRounds />);
        await waitFor(() => assert.strictEqual(loadTeam.mock.calls.length, 1, 'Fetched team'));
        await waitFor(() => assert.strictEqual(loadRounds.mock.calls.length, 1, 'Fetched rounds'));
        await waitFor(() => assert.strictEqual(loadCites.mock.calls.length, 1, 'Fetched cites'));
        await waitFor(() => assert.isOk(screen.queryByText(/Add Cite/), 'Add cite button exists'));

        fireEvent.click(screen.queryByText(/Add Cite/));
        await waitFor(() => assert.isOk(screen.queryByText(/Add cites to/), 'Add cite form exists'));

        const select = document.querySelector('#selectround');
        fireEvent.change(select, { target: { value: '1' } });

        const button = screen.queryByText(/Add Cite/);
        button.disabled = false;
        fireEvent.click(button);
        await waitFor(() => assert.isOk(screen.queryByText(/Failed to add cite/), 'Failure message'));
    });

    it('Handles claiming a page', async () => {
        render(<TeamRounds />);
        await waitFor(() => assert.strictEqual(loadTeam.mock.calls.length, 1, 'Fetched team'));
        await waitFor(() => assert.strictEqual(loadRounds.mock.calls.length, 1, 'Fetched rounds'));
        await waitFor(() => assert.strictEqual(loadCites.mock.calls.length, 1, 'Fetched cites'));
        await waitFor(() => assert.isOk(screen.queryByText(/Claim Page/), 'Claim page button exists'));

        fireEvent.click(screen.queryByText(/Claim Page/));
        await waitFor(() => assert.isOk(screen.queryByText(/Are you sure/), 'Confirm prompt'));
        const confirm = document.querySelector('button[name="confirm"]');
        confirm.disabled = false;
        fireEvent.click(confirm);
        await waitFor(() => assert.isOk(screen.queryByText(/Successfully added link/), 'Success message'));
        await waitFor(() => assert.strictEqual(addTabroomLink.mock.calls.length, 1, 'Called addTabroomLink'));
    });

    it('Handles failure to claim a page', async () => {
        addTabroomLink.mockRejectedValue({ message: 'Failed to add link' });

        render(<TeamRounds />);
        await waitFor(() => assert.strictEqual(loadTeam.mock.calls.length, 1, 'Fetched team'));
        await waitFor(() => assert.strictEqual(loadRounds.mock.calls.length, 1, 'Fetched rounds'));
        await waitFor(() => assert.strictEqual(loadCites.mock.calls.length, 1, 'Fetched cites'));
        await waitFor(() => assert.isOk(screen.queryByText(/Claim Page/), 'Claim page button exists'));

        fireEvent.click(screen.queryByText(/Claim Page/));
        await waitFor(() => assert.isOk(screen.queryByText(/Are you sure/), 'Confirm prompt'));
        const confirm = document.querySelector('button[name="confirm"]');
        confirm.disabled = false;
        fireEvent.click(confirm);
        await waitFor(() => assert.isOk(screen.queryByText(/Failed to add link/), 'Failure message'));
    });

    it('Should optionally filter by side', async () => {
        useParams.mockImplementation(() => ({ caselist: 'testcaselist', school: 'testschool', team: 'testteam', side: 'Aff' }));

        render(<TeamRounds />);
        await waitFor(() => assert.strictEqual(loadTeam.mock.calls.length, 1, 'Fetched team'));
        await waitFor(() => assert.strictEqual(loadRounds.mock.calls.length, 1, 'Fetched rounds'));
        await waitFor(() => assert.strictEqual(loadCites.mock.calls.length, 1, 'Fetched cites'));
        await waitFor(() => assert.isNotOk(screen.queryByText(/Neg Tournament/), 'No Neg Round'));
    });

    it('Renders an error message without caselistData', async () => {
        const defaultCaselistData = store.caselistData;
        store.caselistData = { message: 'No caselistData' };
        render(<TeamRounds />);
        await waitFor(() => assert.strictEqual(loadTeam.mock.calls.length, 1, 'Fetched team'));
        await waitFor(() => assert.strictEqual(loadRounds.mock.calls.length, 1, 'Fetched rounds'));
        await waitFor(() => assert.strictEqual(loadCites.mock.calls.length, 1, 'Fetched cites'));
        await waitFor(() => assert.isOk(screen.queryAllByText('No caselistData'), 'Error message exists'));
        store.caselistData = defaultCaselistData;
    });

    it('Does not render last names or Add buttons for an archived caselist', async () => {
        store.caselistData.archived = true;
        render(<TeamRounds />);
        await waitFor(() => assert.strictEqual(loadTeam.mock.calls.length, 1, 'Fetched team'));
        await waitFor(() => assert.strictEqual(loadRounds.mock.calls.length, 1, 'Fetched rounds'));
        await waitFor(() => assert.strictEqual(loadCites.mock.calls.length, 1, 'Fetched cites'));
        await waitFor(() => assert.isNotOk(screen.queryByText(/Hardy/), 'No last name'));
        await waitFor(() => assert.isNotOk(screen.queryByText(/Claim Page/), 'No Claim Page button'));
        await waitFor(() => assert.isNotOk(screen.queryByText(/Add Round/), 'No Add Round button'));
        await waitFor(() => assert.isNotOk(screen.queryByText(/Add Cite/), 'No Add Cite button'));
        store.caselistData.archived = false;
    });

    it('Optionally renders a team history', async () => {
        render(<TeamRounds />);

        const toggle = await screen.findByTestId('showhistory');
        assert.isOk(toggle, 'Heading exists');
        fireEvent.click(toggle);

        await waitFor(() => assert.isOk(screen.queryByText(/Test team history/), 'Shows history table'));
        fireEvent.click(toggle);
        await waitFor(() => assert.isNotOk(screen.queryByText(/Test team history/), 'Hides history table'));
    });

    it('should not render a team history on an archived caselist', async () => {
        store.caselistData.archived = true;
        render(<TeamRounds />);
        await waitFor(() => assert.isNotOk(screen.queryByText(/Team History/), 'No team history'));
        store.caselistData.archived = false;
    });

    afterEach(() => {
        loadTeam.mockClear();
        loadRounds.mockClear();
        deleteRound.mockClear();
        loadCites.mockClear();
        deleteCite.mockClear();
        addCite.mockClear();
        addTabroomLink.mockClear();
    });
});
