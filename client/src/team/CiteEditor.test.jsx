import React from 'react';
import { assert } from 'chai';
import { vi } from 'vitest';
import { useForm, useWatch } from 'react-hook-form';

import { wrappedRender as render, screen, waitFor, fireEvent } from '../setupTests';

import CiteEditor from './CiteEditor';

vi.mock('react-hook-form', async () => {
    const actual = await vi.importActual('react-hook-form');
    return {
        ...actual,
        useWatch: vi.fn().mockImplementation(() => ([{ id: 0, title: 'Title', cites: 'Cites', open: true }])),
    };
});

vi.mock('@uiw/react-md-editor', async () => {
    return {
        default: vi.fn().mockImplementation(() => <textarea />),
        commands: vi.fn().mockImplementation(() => false),
    };
});

describe('CiteEditor', () => {
    it('Renders a cite editor', async () => {
        const mockRemove = vi.fn();
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

        fireEvent.click(screen.getByTestId('trash'));
        await waitFor(() => assert.strictEqual(mockRemove.mock.calls.length, 1, 'Called remove'));
    });

    it('Renders a warning for old wiki syntax', async () => {
        useWatch.mockImplementation(() => ([{ id: 0, title: 'Title', cites: '= Cites', open: true }]));
        const mockRemove = vi.fn();
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
        fireEvent.click(screen.getByText(/syntax/));
    });

    afterEach(async () => {
        useWatch.mockClear();
    });
});
