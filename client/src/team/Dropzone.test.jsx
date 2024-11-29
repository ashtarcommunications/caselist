import React from 'react';
import { assert, vi } from 'vitest';
import { useForm } from 'react-hook-form';

import { wrappedRender as render, screen, waitFor } from '../setupTests';

import Dropzone from './Dropzone';

describe('Dropzone', () => {
	it('Renders a dropzone', async () => {
		const mockOnDrop = vi.fn();
		const Component = () => {
			const { control } = useForm();
			return <Dropzone onDrop={mockOnDrop} control={control} />;
		};
		render(<Component />);
		assert.isOk(screen.queryByText(/Drag and drop/), 'Dropzone exists');
	});

	it('Renders a loading indicator while processing', async () => {
		const mockOnDrop = vi.fn();
		const Component = () => {
			const { control } = useForm();
			return <Dropzone processing onDrop={mockOnDrop} control={control} />;
		};
		render(<Component />);
		await waitFor(() =>
			assert.isOk(screen.queryByTestId('loader'), 'Loader exists'),
		);
	});
});
