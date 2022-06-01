import React from 'react';
import { assert } from 'chai';

import { wrappedRender as render, screen, fireEvent, waitFor } from '../setupTests';
import AddSchool from './AddSchool';
import { loadTabroomChapters, addSchool } from '../helpers/api';
// eslint-disable-next-line import/named
import { store } from '../helpers/store';

describe('AddSchool', () => {
    it('Renders and submits an add school form', async () => {
        // Check form renders
        render(<AddSchool />);
        await waitFor(() => assert.isOk(screen.queryByText('Add a school to Test Caselist'), 'Heading exists'));
        await waitFor(() => assert.isOk(screen.queryByText('School Name'), 'State input exists'));
        await waitFor(() => assert.isOk(screen.queryByText('State'), 'State input exists'));
        assert.strictEqual(loadTabroomChapters.mock.calls.length, 1, 'Fetched Tabroom chapters');
        await waitFor(() => assert.isOk(document.querySelector('.rw-picker-btn'), 'Combobox dropdown appears'));
        await waitFor(() => assert.isOk(screen.queryByText('Tabroom School'), 'Tabroom chapter is in the dropdown'));

        // Check form accepts inputs
        const schoolName = document.querySelector('input');
        fireEvent.change(schoolName, { target: { value: 'Test School' } });
        assert.strictEqual(schoolName.value, 'Test School', 'Correct School Name input value');

        const state = document.querySelector('select');
        fireEvent.change(state, { target: { value: 'CO' } });
        assert.strictEqual(state.value, 'CO', 'Correct State select value');

        // Submit form - have to manually disable button because of react-hook-form
        const button = screen.getByRole('button', { name: 'Add' });
        button.disabled = false;
        fireEvent.click(button);
        await waitFor(() => assert.strictEqual(addSchool.mock.calls.length, 1, 'Submitted the form'));
        assert.strictEqual(store.fetchSchools.mock.calls.length, 1, 'Refetched schools');
        await waitFor(() => assert.isOk(screen.queryByText('Successfully added school'), 'Success notification exists'));

        // Check error messages
        fireEvent.change(schoolName, { target: { value: 'Test school' } });
        await waitFor(() => assert.isOk(screen.queryByText(/School name should be title case/), 'Title case warning exists'));
    });

    it('Displays an error message on failure', async () => {
        addSchool.mockRejectedValue({ message: 'Failed to create school' });

        render(<AddSchool />);
        await waitFor(() => assert.isOk(screen.queryByText('Add a school to Test Caselist'), 'Heading exists'));

        fireEvent.change(document.querySelector('input'), { target: { value: 'Test School' } });
        fireEvent.change(document.querySelector('select'), { target: { value: 'CO' } });

        const button = screen.getByRole('button', { name: 'Add' });
        button.disabled = false;
        fireEvent.click(button);
        await waitFor(() => assert.isOk(screen.queryByText(/Failed to add school/), 'Failure notification exists'));
    });

    it('Renders an error message without caselistData', async () => {
        store.caselistData = { message: 'No caselistData' };
        render(<AddSchool />);
        await waitFor(() => assert.isOk(screen.queryAllByText('No caselistData'), 'Error message exists'));
        store.caselistData = { caselist_id: 1, name: 'test', display_name: 'Test Caselist', event: 'cx', level: 'hs' };
    });

    it('Handles failure to fetch Tabroom chapters', async () => {
        loadTabroomChapters.mockRejectedValue(() => { throw new Error('Failed to fetch Tabroom chapters'); });
        render(<AddSchool />);
        assert.strictEqual(loadTabroomChapters.mock.calls.length, 1, 'Attempted to fetch Tabroom chapters');
        await waitFor(() => assert.isOk(screen.queryByText('Add a school to Test Caselist'), 'Heading exists'));
    });

    afterEach(() => {
        loadTabroomChapters.mockReset();
        addSchool.mockReset();
    });
});
