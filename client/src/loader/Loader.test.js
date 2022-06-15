import React from 'react';
import { assert } from 'chai';

import { wrappedRender as render, waitFor } from '../setupTests';
import Loader from './Loader';

describe('Loader', () => {
    it('Renders a loader', async () => {
        render(<Loader />);

        await waitFor(() => assert.isOk(document.querySelector('.loader'), 'Loader exists'));
    });
});
