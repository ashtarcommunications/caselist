import React from 'react';
import { assert } from 'chai';
import { vi } from 'vitest';

import { wrappedRender as render, fireEvent, waitFor } from '../setupTests';
import StatesDropdown from './StatesDropdown';

describe('StatesDropdown', () => {
    const mockChangeStateCode = vi.fn();
    it('Renders a states dropdown and triggers the change handler', async () => {
        render(<StatesDropdown stateCode="CO" changeStateCode={mockChangeStateCode} />);
        const dropdown = document.querySelector('select');
        await waitFor(() => assert.isOk(dropdown, 'Select exists'));

        fireEvent.change(dropdown, { target: { value: 'IA' } });
        assert.strictEqual(mockChangeStateCode.mock.calls.length, 1, 'Called changeStateCode');
    });
});
