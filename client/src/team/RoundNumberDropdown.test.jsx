import React from 'react';
import { assert } from 'chai';
import { vi } from 'vitest';

import { wrappedRender as render, fireEvent, waitFor } from '../setupTests';
import RoundNumberDropdown from './RoundNumberDropdown';

describe('RoundNumberDropdown', () => {
    const mockOnChange = vi.fn();
    it('Renders a round dropdown and triggers the change handler', async () => {
        render(<RoundNumberDropdown onChange={mockOnChange} />);
        const dropdown = document.querySelector('select');
        await waitFor(() => assert.isOk(dropdown, 'Select exists'));

        fireEvent.change(dropdown, { target: { value: '2' } });
        assert.strictEqual(mockOnChange.mock.calls.length, 1, 'Called onChange');
    });
});
