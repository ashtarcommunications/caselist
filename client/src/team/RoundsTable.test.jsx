import React from 'react';
import { assert } from 'chai';
import { vi } from 'vitest';

import { wrappedRender as render, screen, fireEvent } from '../setupTests';

import RoundsTable from './RoundsTable';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: vi.fn().mockImplementation(() => ({ caselist: 'testcaselist', school: 'testschool', team: 'testteam' })),
    };
});

describe('RoundsTable', () => {
    it('Renders a rounds table', async () => {
        const mockHandleDeleteRoundConfirm = vi.fn();
        const mockHandleToggleAll = vi.fn();
        const mockHandleToggleReport = vi.fn();
        render(
            <RoundsTable
                event="cx"
                rounds={[{ round_id: 1, tournament: 'Test Tournament', side: 'A', round: '1', opponent: 'Test Opponent', judge: 'Test Judge', report: 'Test Report', opensource: '/test/', video: 'https://video.com' }]}
                handleDeleteRoundConfirm={mockHandleDeleteRoundConfirm}
                handleToggleAll={mockHandleToggleAll}
                handleToggleReport={mockHandleToggleReport}
            />
        );
        assert.isOk(screen.queryByText(/Test Tournament/), 'Test Tournament exists');
        assert.isOk(screen.queryByTestId('calendar'), 'Calendar sort exists');
        assert.isOk(screen.queryByText(/Round 1/), 'Round exists');
        assert.isOk(screen.queryByText(/Aff/), 'Side exists');
        assert.isOk(screen.queryByText(/Test Opponent/), 'Opponent exists');
        assert.isOk(screen.queryByText(/Test Judge/), 'Judge exists');
        assert.isOk(screen.queryByText(/Test Report/), 'Report exists');

        fireEvent.click(screen.queryByText(/Expand All/));
        assert.strictEqual(mockHandleToggleAll.mock.calls.length, 1, 'handleToggleAll called');

        fireEvent.click(screen.queryByTestId('togglereport'));
        assert.strictEqual(mockHandleToggleReport.mock.calls.length, 1, 'handleToggleReport called');

        assert.isOk(screen.queryByTestId('download'), 'Download icon exists');
        assert.isOk(screen.queryByTestId('video'), 'Video link exists');

        assert.isOk(screen.queryByTestId('edit'), 'Edit link exists');

        fireEvent.click(screen.queryByTestId('trash-round'));
        assert.strictEqual(mockHandleDeleteRoundConfirm.mock.calls.length, 1, 'handleDeleteRoundConfirm called');
    });

    it('should not render edit or delete icon for archived caselists', async () => {
        const mockHandleDeleteRoundConfirm = vi.fn();
        const mockHandleToggleAll = vi.fn();
        const mockHandleToggleReport = vi.fn();
        render(
            <RoundsTable
                archived
                event="cx"
                rounds={[{ round_id: 1, tournament: 'Test Tournament', side: 'A', round: '1', opponent: 'Test Opponent', judge: 'Test Judge', report: 'Test Report', opensource: '/test/', video: 'https://video.com' }]}
                handleDeleteRoundConfirm={mockHandleDeleteRoundConfirm}
                handleToggleAll={mockHandleToggleAll}
                handleToggleReport={mockHandleToggleReport}
            />
        );
        assert.isNotOk(screen.queryByTestId('edit'), 'No edit icon');
        assert.isNotOk(screen.queryByTestId('trash-round'), 'No delete icon');
    });

    it('should display a Collapse All button if all reports are open', async () => {
        const mockHandleDeleteRoundConfirm = vi.fn();
        const mockHandleToggleAll = vi.fn();
        const mockHandleToggleReport = vi.fn();
        render(
            <RoundsTable
                allRoundsOpen
                event="cx"
                rounds={[{ round_id: 1, tournament: 'Test Tournament', side: 'A', round: '1', opponent: 'Test Opponent', judge: 'Test Judge', report: 'Test Report', opensource: '/test/', video: 'https://video.com' }]}
                handleDeleteRoundConfirm={mockHandleDeleteRoundConfirm}
                handleToggleAll={mockHandleToggleAll}
                handleToggleReport={mockHandleToggleReport}
            />
        );
        assert.isOk(screen.queryByText(/Collapse All/), 'Collapse All button exists');
    });
});
