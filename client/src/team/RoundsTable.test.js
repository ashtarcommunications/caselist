import React from 'react';
import { assert } from 'chai';

import { wrappedRender as render, screen, fireEvent } from '../setupTests';

import RoundsTable from './RoundsTable';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn().mockImplementation(() => ({ caselist: 'testcaselist', school: 'testschool', team: 'testteam' })),
}));

describe('RoundsTable', () => {
    it('Renders a rounds table', async () => {
        const mockHandleDeleteRoundConfirm = jest.fn();
        const mockHandleToggleAll = jest.fn();
        const mockHandleToggleReport = jest.fn();
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
        assert.isOk(document.querySelector('.calendar'), 'Calendar sort exists');
        assert.isOk(screen.queryByText(/Round 1/), 'Round exists');
        assert.isOk(screen.queryByText(/Aff/), 'Side exists');
        assert.isOk(screen.queryByText(/Test Opponent/), 'Opponent exists');
        assert.isOk(screen.queryByText(/Test Judge/), 'Judge exists');
        assert.isOk(screen.queryByText(/Test Report/), 'Report exists');

        fireEvent.click(screen.queryByText(/Expand All/));
        assert.strictEqual(mockHandleToggleAll.mock.calls.length, 1, 'handleToggleAll called');

        fireEvent.click(document.querySelector('.togglereport'));
        assert.strictEqual(mockHandleToggleReport.mock.calls.length, 1, 'handleToggleReport called');

        assert.isOk(document.querySelector('.download'), 'Download icon exists');
        assert.isOk(document.querySelector('.video'), 'Video link exists');

        assert.isOk(document.querySelector('.edit'), 'Edit link exists');

        fireEvent.click(document.querySelector('.trash'));
        assert.strictEqual(mockHandleDeleteRoundConfirm.mock.calls.length, 1, 'handleDeleteRoundConfirm called');
    });

    it('should not render edit or delete icon for archived caselists', async () => {
        const mockHandleDeleteRoundConfirm = jest.fn();
        const mockHandleToggleAll = jest.fn();
        const mockHandleToggleReport = jest.fn();
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
        assert.isNotOk(document.querySelector('.edit'), 'No edit icon');
        assert.isNotOk(document.querySelector('.trash'), 'No delete icon');
    });

    it('should display a Collapse All button if all reports are open', async () => {
        const mockHandleDeleteRoundConfirm = jest.fn();
        const mockHandleToggleAll = jest.fn();
        const mockHandleToggleReport = jest.fn();
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
