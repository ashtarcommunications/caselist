import React from 'react';
import { assert } from 'chai';
import { startOfYear } from '@speechanddebate/nsda-js-utils';
import { vi } from 'vitest';

import { wrappedRender as render, screen, fireEvent, waitFor } from '../setupTests';
import { addOpenEvFile } from '../helpers/api';

import OpenEvUpload from './OpenEvUpload';

const mockStartOfYear = startOfYear;
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: vi.fn().mockImplementation(() => ({ year: mockStartOfYear })),
    };
});

describe('Open Ev Upload', () => {
    it('Renders and submits an upload form', async () => {
        render(<OpenEvUpload />);
        await waitFor(() => assert.isOk(screen.queryByText(/Upload a file/), 'Heading exists'));

        const title = document.querySelector('input[name="title"');
        fireEvent.change(title, { target: { value: 'test title' } });
        await waitFor(() => assert.isOk(screen.queryByText(/title case/), 'Title case warning exists'));
        fireEvent.change(title, { target: { value: '!error!' } });
        await waitFor(() => assert.isOk(screen.queryByText(/letters and numbers/), 'Alphanumeric warning exists'));
        fireEvent.change(title, { target: { value: 'Test Title' } });
        assert.strictEqual(title.value, 'Test Title', 'Correct title input value');

        const camp = document.querySelector('select[name="camp"');
        fireEvent.change(camp, { target: { value: 'CNDI' } });
        assert.strictEqual(camp.value, 'CNDI', 'Correct camp value');

        const lab = document.querySelector('input[name="lab"');
        fireEvent.change(lab, { target: { value: '!error!' } });
        await waitFor(() => assert.isOk(screen.queryByText(/letters and numbers/), 'Alphanumeric warning exists'));
        fireEvent.change(lab, { target: { value: 'ab' } });
        await waitFor(() => assert.isOk(screen.queryByText(/all caps/), 'All Caps warning exists'));
        fireEvent.change(lab, { target: { value: 'AB' } });
        assert.strictEqual(lab.value, 'AB', 'Correct lab input value');

        await waitFor(() => assert.isOk(screen.queryByText(/Affirmatives/), 'Tag checkboxes exist'));

        const dropzone = document.querySelector('div[class*="dropzone"] input');
        const file = new File(['file'], 'test.docx', { type: 'text/plain' });
        Object.defineProperty(dropzone, 'files', { value: [file] });
        fireEvent.drop(dropzone);
        await waitFor(() => assert.isOk(dropzone.files, 'Dropzone has files'));
        await waitFor(() => assert.isNotOk(document.querySelector('.dropzone input'), 'Dropzone is gone'));

        await waitFor(() => assert.isOk(dropzone.files, 'Dropzone has files'));
        await waitFor(() => assert.isOk(screen.queryByText(/test.docx/), 'Uploaded file listed'));
        const renamed = new RegExp(`Test Title - CNDI ${startOfYear} AB.docx`, 'g');
        await waitFor(() => assert.isOk(screen.queryByText(renamed), 'Renamed filename'));

        const button = document.querySelector('button[type="submit"]');
        button.disabled = false;
        fireEvent.click(button);
        await waitFor(() => assert.strictEqual(addOpenEvFile.mock.calls.length, 1, 'Submitted the form'));
        await waitFor(() => assert.isOk(screen.queryByText(/Successfully added file/), 'Success notification'));
        await waitFor(() => assert.isNotOk(screen.queryByText(/test.docx/), 'Uploaded file reset'));
        await waitFor(() => assert.isOk(screen.queryByText(/Drag and drop/), 'Dropzone appears'));
    });

    it('Displays an error message on failure', async () => {
        addOpenEvFile.mockRejectedValue({ message: 'Failed to create school' });

        render(<OpenEvUpload />);

        fireEvent.change(document.querySelector('input[name="title"]'), { target: { value: 'Test Title' } });
        fireEvent.change(document.querySelector('select'), { target: { value: 'CNDI' } });
        fireEvent.change(document.querySelector('input[name="lab"]'), { target: { value: 'AB' } });

        const dropzone = document.querySelector('div[class*="dropzone"] input');
        const file = new File(['file'], 'test.docx', { type: 'text/plain' });
        Object.defineProperty(dropzone, 'files', { value: [file] });
        fireEvent.drop(dropzone);
        await waitFor(() => assert.isNotOk(document.querySelector('.dropzone input'), 'Dropzone is gone'));

        await waitFor(() => assert.isOk(dropzone.files, 'Dropzone has files'));

        const button = document.querySelector('button[type="submit"]');
        button.disabled = false;
        fireEvent.click(button);
        await waitFor(() => assert.isOk(screen.queryByText(/Failed to add file/), 'Failure notification exists'));
    });

    afterEach(() => {
        addOpenEvFile.mockClear();
    });
});
