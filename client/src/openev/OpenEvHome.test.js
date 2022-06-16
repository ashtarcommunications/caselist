import React from 'react';
import { assert } from 'chai';
import { useParams } from 'react-router-dom';
import { startOfYear } from '@speechanddebate/nsda-js-utils';

import { wrappedRender as render, screen, waitFor } from '../setupTests';
import OpenEvHome from './OpenEvHome';
// eslint-disable-next-line import/named
import { store } from '../helpers/store';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn().mockImplementation(() => ({})),
}));

describe('OpenEvHome', () => {
    it('Renders an openev homepage', async () => {
        render(<OpenEvHome />);
        await waitFor(() => assert.isOk(document.querySelector('.breadcrumbs'), 'Breadcrumbs exists'));
        await waitFor(() => assert.isOk(screen.queryByText(/Open Evidence Files/), 'Heading exists'));
        await waitFor(() => assert.isOk(screen.queryByText(/Test.docx/), 'Table exists'));
        await waitFor(() => assert.isOk(screen.queryByText(/Add File/), 'Button exists'));
    });

    it('Renders an error message without openEvFiles', async () => {
        const defaultOpenEvFiles = store.openEvFiles;
        store.openEvFiles = { message: 'No files' };
        render(<OpenEvHome />);
        await waitFor(() => assert.isOk(screen.queryAllByText('No files'), 'Error message exists'));
        store.openEvFiles = defaultOpenEvFiles;
    });

    it('Renders files for a year and tag', async () => {
        useParams.mockImplementation(() => ({ year: startOfYear, tag: 'da' }));
        render(<OpenEvHome />);
        await waitFor(() => assert.isOk(screen.queryByText(/Test.docx/), 'Table exists'));
    });
});
