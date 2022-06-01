import React from 'react';
import { assert } from 'chai';

import { wrappedRender as render, screen, waitFor } from '../setupTests';
import Breadcrumbs from './Breadcrumbs';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn().mockImplementation(() => ({ caselist: 'testcaselist', school: 'testschool', team: 'testteam', year: '2022', tag: 'aff' })),
    uselocation: jest.fn().mockImplementation(() => ({ pathname: 'openev' })),
}));

describe('Home', () => {
    it('Renders caselist breadcrumbs', async () => {
        render(<Breadcrumbs />);

        await waitFor(() => assert.isOk(document.querySelector('.home'), 'Home icon exists'));

        assert.isOk(screen.queryByText(/testcaselist/), 'Caselist link');
        assert.isOk(screen.queryByText(/Test School/), 'School link');
        assert.isOk(screen.queryByText(/testteam/), 'Team link');

        assert.isOk(screen.queryByText(/2022/), 'Year link');
        assert.isOk(screen.queryByText(/Affirmatives/), 'Tag link');
    });
});
