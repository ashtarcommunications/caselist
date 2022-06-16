import React from 'react';
import { assert } from 'chai';
import { useNavigate } from 'react-router-dom';

import { wrappedRender as render, screen, fireEvent, waitFor } from '../setupTests';

import SearchForm from './SearchForm';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn().mockImplementation(() => ({ caselist: 'testcaselist', school: 'testschool', team: 'testteam' })),
    useNavigate: jest.fn().mockImplementation(() => () => true),
    uselocation: jest.fn().mockImplementation(() => ({ pathname: 'testcaselist' })),
}));

describe('SearchForm', () => {
    it('Renders and submits a search form', async () => {
        render(<SearchForm />);
        assert.isOk(document.querySelector('input'), 'Form exists');
        const button = screen.getByRole('button');
        assert.isTrue(button.disabled);
        fireEvent.change(document.querySelector('input'), { target: { value: 'test' } });
        assert.isFalse(button.disabled);
        fireEvent.click(button);
        await waitFor(() => assert.isAtLeast(useNavigate.mock.calls.length, 1, 'Navigated to next page'));
    });

    afterEach(() => {
        useNavigate.mockReset();
    });
});
