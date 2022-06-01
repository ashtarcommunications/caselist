import React from 'react';
import { assert } from 'chai';

import { wrappedRender as render, screen, fireEvent, waitFor } from '../setupTests';
import ConfirmButton from './ConfirmButton';

describe('ConfirmButton', () => {
    const mockHandler = jest.fn();
    const mockDismiss = jest.fn();

    it('Renders a confirm button', async () => {
        render(<ConfirmButton message="Sure?" handler={mockHandler} />);
        await waitFor(() => screen.queryByText('Sure?'));
        await waitFor(() => assert.isOk(screen.queryAllByRole('button'), 'Buttons exist'));
        fireEvent.click(screen.queryByText('Confirm'));
        assert.strictEqual(mockHandler.mock.calls.length, 1, 'Called handler');
    });

    it('Optionally renders a dismiss button', async () => {
        render(<ConfirmButton dismiss={mockDismiss} handler={mockHandler} />);
        fireEvent.click(screen.queryByText('Cancel'));
        assert.strictEqual(mockDismiss.mock.calls.length, 1, 'Called dismiss');
    });

    it('Optionally renders a confirm input', async () => {
        render(<ConfirmButton requireInput handler={mockHandler} />);
        fireEvent.click(screen.queryByText('Cancel'));
        await waitFor(() => assert.isOk(screen.queryByRole('textbox'), 'Input exists'));
        const submit = document.querySelector('button[type="submit"]');
        assert.isTrue(submit.disabled);
        fireEvent.change(screen.queryByRole('textbox'), { target: { value: 'Invalid' } });
        assert.isTrue(submit.disabled);
        fireEvent.change(screen.queryByRole('textbox'), { target: { value: 'I am certain' } });
        assert.isFalse(submit.disabled);
    });

    afterEach(async () => {
        mockHandler.mockReset();
    });
});
