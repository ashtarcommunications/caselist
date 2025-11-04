import { wrappedRender as render, screen } from '../setupTests';
import PreviewFile from './PreviewFile';
import { downloadFile } from './api.js';

describe('PreviewFile', () => {
	it('Previews a file', async () => {
		render(<PreviewFile />, {
			route: '/preview',
			path: '/preview?path=test.docx',
		});

		await screen.findByText(/Loading/);
		await screen.findByText('Test Contents');
		await screen.findByLabelText('Download');
	});

	it('Handles download failure', async () => {
		downloadFile.mockRejectedValue(new Error('Failed to download'));
		render(<PreviewFile />, {
			route: '/preview',
			path: '/preview?path=test.docx',
		});
		await screen.findByText(/Error/);
	});

	it('Display an error for non-docx files', async () => {
		render(<PreviewFile />, {
			route: '/preview',
			path: '/preview?path=test.pdf',
		});
		await screen.findByText(/only \.docx/i);
	});

	it('Display an error for no path provided', async () => {
		render(<PreviewFile />, {
			route: '/preview',
			path: '/preview?path=',
		});
		await screen.findByText(/no file/i);
	});
});
