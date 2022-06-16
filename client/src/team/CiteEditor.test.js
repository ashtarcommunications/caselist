import React from 'react';
import { assert } from 'chai';
import { useForm, useWatch } from 'react-hook-form';

import { wrappedRender as render, waitFor, fireEvent } from '../setupTests';

import CiteEditor from './CiteEditor';

jest.mock('react-hook-form', () => ({
    ...jest.requireActual('react-hook-form'),
    useWatch: jest.fn().mockImplementation(() => ([{ id: 0, title: 'Title', cites: 'Cites', open: true }])),
}));

describe('CiteEditor', () => {
    it('Renders a cite editor', async () => {
        const mockRemove = jest.fn();
        const Component = () => {
            const { register, control } = useForm();
            const cite = { id: 0, title: 'Title', cites: 'Cites', open: true };
            return (
                <CiteEditor
                    item={cite}
                    index={0}
                    register={register}
                    control={control}
                    remove={mockRemove}
                />
            );
        };
        render(<Component />);
        await waitFor(() => assert.isOk(document.querySelector('input[type="text"]'), 'Renders a title'));
        await waitFor(() => assert.isOk(document.querySelector('textarea'), 'Renders a cite box'));
        await waitFor(() => assert.isOk(document.querySelector('input[type="checkbox"]'), 'Renders an open toggle'));
        fireEvent.click(document.querySelector('.trash'));
        await waitFor(() => assert.strictEqual(mockRemove.mock.calls.length, 1, 'Called remove'));
    });

    it('Renders a warning for old wiki syntax', async () => {
        useWatch.mockImplementation(() => ([{ id: 0, title: 'Title', cites: '= Cites', open: true }]));
        const mockRemove = jest.fn();
        const Component = () => {
            const { register, control } = useForm();
            const cite = { id: 0, title: 'Title', cites: '= Cites', open: true };
            return (
                <CiteEditor
                    item={cite}
                    index={0}
                    register={register}
                    control={control}
                    remove={mockRemove}
                />
            );
        };
        render(<Component />);
        await waitFor(() => assert.isOk(document.querySelector('.syntax'), 'Renders a syntax warning'));
    });

    afterEach(async () => {
        useWatch.mockReset();
    });
});
