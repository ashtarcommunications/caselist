import React from 'react';
import { ToastContainer } from 'react-toastify';
import { assert } from 'chai';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import DownloadFile from './DownloadFile';
import { downloadFile } from './api';

jest.mock('../helpers/api');

describe('DownloadFile', () => {
    it('Downloads a file', async () => {
        render(<DownloadFile text="Download File" path="/test" />);

        assert.isOk(screen.queryByText('Download File'), 'Provided text is rendered');
        const icon = screen.getByRole('img');
        assert.isOk(icon, 'Renders a download icon');
        fireEvent.click(icon);
        assert.strictEqual(downloadFile.mock.calls.length, 1, 'Called downloadFile');
    });

    it('Handles download failure', async () => {
        downloadFile.mockRejectedValue(new Error('Failed to download'));
        render(
            <>
                <DownloadFile text="Download File" path="/test" />
                <ToastContainer />
            </>
        );
        fireEvent.click(screen.getByRole('img'));
        await waitFor(() => assert.isOk(screen.queryByText('Failed to download'), 'Error notification exists'));
    });
});
