import React from 'react';
import { assert } from 'chai';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import { wrappedRender as render, screen, fireEvent, waitFor } from '../setupTests';

import SearchForm from './SearchForm';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn().mockImplementation(() => ({ caselist: 'testcaselist', school: 'testschool', team: 'testteam' })),
    useNavigate: jest.fn().mockImplementation(() => () => true),
    useLocation: jest.fn().mockImplementation(() => ({ pathname: 'testcaselist' })),
}));

describe('SearchForm', () => {
    it('Renders and submits a search form', async () => {
        render(<SearchForm />);
        assert.isOk(document.querySelector('input'), 'Form exists');
        fireEvent.change(document.querySelector('input'), { target: { value: 'update' } });
        const button = screen.getByRole('button');
        fireEvent.click(button);
        await waitFor(() => assert.isAtLeast(useNavigate.mock.calls.length, 1, 'Navigated to next page'));
    });

    it('Works for open evidence', async () => {
        useParams.mockImplementation(() => ({ year: '2021' }));
        render(<SearchForm />);
        fireEvent.click(screen.getByRole('button'));
        await waitFor(() => assert.isAtLeast(useNavigate.mock.calls.length, 1, 'Navigated to next page'));
    });

    it('Works for open evidence without a year', async () => {
        useParams.mockImplementation(() => ({}));
        useLocation.mockImplementation(() => ({ pathname: 'openev' }));
        render(<SearchForm />);
        fireEvent.click(screen.getByRole('button'));
        await waitFor(() => assert.isAtLeast(useNavigate.mock.calls.length, 1, 'Navigated to next page'));
    });

    afterEach(() => {
        useNavigate.mockClear();
        useLocation.mockClear();
    });
});
