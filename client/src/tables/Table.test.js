import React from 'react';
import { assert } from 'chai';

import { wrappedRender as render, waitFor } from '../setupTests';

import Table from './Table';

describe('Table', () => {
    it('Renders a table', async () => {
        render(<Table columns={[]} data={[]} />);
        await waitFor(() => assert.isOk(document.querySelector('table'), 'Renders a table'));
    });

    it('Renders a loading indicator', async () => {
        render(<Table columns={[]} data={[]} loading />);

        await waitFor(() => assert.isOk(document.querySelector('.loader'), 'Loading indicator'));
    });

    it('Renders nothing without columns or data', async () => {
        const container = render(<Table />);
        assert.isNotOk(container.firstChild, 'Renders nothing');
    });
});
