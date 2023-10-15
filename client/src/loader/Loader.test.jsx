import React from 'react';

import { wrappedRender as render, screen } from '../setupTests';
import Loader from './Loader';

describe('Loader', () => {
    it('Renders a loader', async () => {
        render(<Loader />);

        await screen.findByTestId('loader');
    });
});
