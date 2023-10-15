import React from 'react';
import { assert } from 'chai';
import { vi } from 'vitest';

import { wrappedRender as render, fireEvent, waitFor } from '../setupTests';
import SideDropdown from './SideDropdown';

describe('SideDropdown', () => {
    const mockOnChange = vi.fn();
    it('Renders a side dropdown and triggers the change handler', async () => {
        render(<SideDropdown onChange={mockOnChange} />);
        const dropdown = document.querySelector('select');
        await waitFor(() => assert.isOk(dropdown, 'Select exists'));

        fireEvent.change(dropdown, { target: { value: 'N' } });
        assert.strictEqual(mockOnChange.mock.calls.length, 1, 'Called onChange');
    });
});
