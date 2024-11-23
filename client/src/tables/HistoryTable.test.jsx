import React from 'react';
import { assert } from 'chai';
import { vi } from 'vitest';

import { wrappedRender as render, screen, waitFor } from '../setupTests';

import HistoryTable from './HistoryTable';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: vi.fn().mockImplementation(() => ({ caselist: 'testcaselist', school: 'testschool', team: 'testteam' })),
    };
});

describe('HistoryTable', () => {
    it('Renders a history table for a school', async () => {
        render(<HistoryTable type="school" />);

        await waitFor(() => assert.isOk(screen.queryByText(/Test school history/), 'Description exists'));
        await waitFor(() => assert.isOk(screen.queryByText(/2023/), 'Date exists'));
        await waitFor(() => assert.isOk(screen.queryByText(/Test User/), 'User exists'));
    });

    it('Renders a history table for a team', async () => {
        render(<HistoryTable type="team" />);

        await waitFor(() => assert.isOk(screen.queryByText(/Test team history/), 'Description exists'));
        await waitFor(() => assert.isOk(screen.queryByText(/2023/), 'Date exists'));
        await waitFor(() => assert.isOk(screen.queryByText(/Test User/), 'User exists'));
    });
});
