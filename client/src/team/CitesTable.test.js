import React from 'react';
import { assert } from 'chai';

import { wrappedRender as render, screen, fireEvent } from '../setupTests';

import CitesTable from './CitesTable';

describe('CitesTable', () => {
    it('Renders a cites table', async () => {
        const mockHandleDeleteCiteConfirm = jest.fn();
        const mockHandleToggleCites = jest.fn();
        render(
            <CitesTable
                event="cx"
                cites={[{ cite_id: 1, title: 'Title', cites: 'Cite Content', tournament: 'Tournament', side: 'A', round: '1', opponent: 'Opponent', judge: 'Judge', citesopen: true }]}
                handleDeleteCiteConfirm={mockHandleDeleteCiteConfirm}
                handleToggleCites={mockHandleToggleCites}
            />
        );
        assert.isOk(screen.queryByText(/Title/), 'Cite title exists');
        assert.isOk(document.querySelector('.calendar'), 'Calendar sort exists');
        assert.isOk(screen.queryByText(/Cite Content/), 'Cite content exists');

        fireEvent.click(screen.queryByText(/Title/));
        assert.strictEqual(mockHandleToggleCites.mock.calls.length, 1, 'handleToggleCites called');

        fireEvent.click(document.querySelector('.copy'));
        assert.strictEqual(global.navigator.clipboard.writeText.mock.calls.length, 1, 'handleCopyCites called');

        fireEvent.click(document.querySelector('.trash'));
        assert.strictEqual(mockHandleDeleteCiteConfirm.mock.calls.length, 1, 'handleDeleteCiteConfirm called');

        global.navigator.clipboard.writeText.mockReset();
    });

    it('should render nothing without cites', async () => {
        const mockHandleDeleteCiteConfirm = jest.fn();
        const mockHandleToggleCites = jest.fn();
        const container = render(
            <CitesTable
                cites={[]}
                handleDeleteCiteConfirm={mockHandleDeleteCiteConfirm}
                handleToggleCites={mockHandleToggleCites}
            />
        );
        assert.isNotOk(container.firstChild, 'Renders nothing');
    });

    it('should not render a delete icon for archived caselists', async () => {
        const mockHandleDeleteCiteConfirm = jest.fn();
        const mockHandleToggleCites = jest.fn();
        render(
            <CitesTable
                archived
                cites={[{ cite_id: 1, title: 'Title', cites: 'Cites', tournament: 'Tournament', side: 'A', round: '1', opponent: 'Opponent', judge: 'Judge', citesopen: true }]}
                handleDeleteCiteConfirm={mockHandleDeleteCiteConfirm}
                handleToggleCites={mockHandleToggleCites}
            />
        );
        assert.isNotOk(document.querySelector('.trash'), 'No delete icon');
    });
});
