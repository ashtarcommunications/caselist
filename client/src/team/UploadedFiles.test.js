import React from 'react';
import { assert } from 'chai';

import { wrappedRender as render, screen, fireEvent, waitFor } from '../setupTests';
import UploadedFiles from './UploadedFiles';

describe('UploadedFiles', () => {
    const mockHandleResetFiles = jest.fn();

    it('Renders uploaded files and triggers the change handler', async () => {
        render(<UploadedFiles files={[{ path: '/test' }]} handleResetFiles={mockHandleResetFiles} />);
        await waitFor(() => assert.isOk(screen.queryByText(/test/), 'Path exists'));
        await waitFor(() => assert.isOk(document.querySelector('.trash'), 'Delete icon exists'));

        fireEvent.click(document.querySelector('.trash'));
        assert.strictEqual(mockHandleResetFiles.mock.calls.length, 1, 'Called handleResetFiles');
    });

    it('Optionally renders a filename', async () => {
        render(<UploadedFiles files={[{ path: '/test' }]} filename="Test.docx" showFilename handleResetFiles={mockHandleResetFiles} />);
        await waitFor(() => assert.isOk(screen.queryByText(/Test.docx/), 'Filename'));
    });
});
