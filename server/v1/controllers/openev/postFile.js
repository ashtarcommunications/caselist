import SQL from 'sql-template-strings';
import fs from 'fs';
import path from 'path';
import { query } from '../../helpers/mysql.js';
import log from '../log/insertEventLog.js';
import config from '../../../config.js';
import { debugLogger } from '../../helpers/logger.js';

const postFile = {
	POST: async (req, res) => {
		const campDisplayName = {
			BDL: 'BDL',
			BDPW: 'Baylor',
			CDC: 'Classic Debate Camp',
			CNDI: 'CNDI',
			CDL: 'CDL',
			DBQ: 'Debate Boutique',
			DDI: 'DDI',
			DDIx: 'DDIx',
			ENDI: 'Emory',
			GDS: 'Georgetown',
			UGA: 'Georgia',
			GMDI: 'George Mason',
			GDI: 'GDI',
			HDC: 'Harvard',
			HOU: 'Houston',
			HSS: 'HSS',
			JDI: 'JDI',
			KKB: 'Kankee Briefs',
			MGC: 'Mean Green',
			UM7: 'Michigan',
			UMC: 'Michigan Classic',
			MNDI: 'MNDI',
			SDI: 'SDI',
			MSDI: 'MSDI',
			MGF: 'MoneyGram',
			NSD: 'NSD',
			NAUDL: 'NAUDL',
			NDI: 'NDI',
			NHSI: 'Northwestern',
			SSDI: 'Samford',
			SCDI: 'SCDI',
			UMKC: 'UMKC',
			UTNIF: 'UTNIF',
			UNT: 'UNT',
			UTD: 'UTD',
			TDI: 'TDI',
			RKS: 'Wake',
			WSDI: 'WSDI',
			WYO: 'Wyoming',
		};

		// Convert base64 encoded file back into a buffer for saving
		let arrayBuffer;
		try {
			arrayBuffer = Buffer.from(req.body.file, 'base64');
		} catch (err) {
			return res.status(400).json({ message: 'Invalid file' });
		}

		// Use the extension from the provided file, but disallow anything weird
		let extension = path.extname(req.body.filename);
		if (['.docx', '.doc', '.pdf', '.rtf', '.txt'].indexOf(extension) === -1) {
			extension = '';
		}

		const sanitize = (s) => {
			return s
				?.replaceAll('/', '')
				.replaceAll('\\', '')
				.replaceAll('..', '')
				.trim();
		};

		const title = sanitize(req.body.title);
		const camp = campDisplayName[sanitize(req.body.camp)];
		const lab = req.body.lab ? sanitize(req.body.lab) : '';

		let filename = `${title} - ${camp} ${req.body.year}`;
		if (req.body.lab) {
			filename += ` ${lab}`;
		}

		const uploadDir = `openev/${req.body.year}/${sanitize(req.body.camp)}`;
		const filePath = `${uploadDir}/${filename}${extension}`;

		const file = await query(SQL`
            SELECT * FROM openev WHERE path = ${filePath}
        `);
		if (file.length > 0) {
			return res.status(400).json({ message: 'File already exists' });
		}

		try {
			await fs.promises.mkdir(`${config.UPLOAD_DIR}/${uploadDir}`, {
				recursive: true,
			});
			await fs.promises.writeFile(
				`${config.UPLOAD_DIR}/${filePath}`,
				arrayBuffer,
			);
		} catch (err) {
			debugLogger.info(`Error while creating file ${filePath}: ${err.message}`);
			return res.status(500).json({ message: 'Error while creating file' });
		}

		await query(SQL`
            INSERT INTO openev (name, path, year, camp, lab, tags, created_by_id)
            VALUES (
                ${filename},
                ${filePath},
                ${req.body.year},
                ${req.body.camp?.trim()},
                ${req.body.lab?.trim()},
                ${JSON.stringify(req.body.tags)},
                ${req.user_id}
            )
        `);

		await log({
			user_id: req.user_id,
			tag: 'openev-add',
			description: `Added file ${path}${filename} to OpenEv ${req.body.year}`,
		});

		return res.status(201).json({ message: 'File successfully uploaded' });
	},
};

postFile.POST.apiDoc = {
	summary: 'Creates an OpenEv file',
	operationId: 'postFile',
	requestBody: {
		description: 'The file to upload',
		required: true,
		content: { '*/*': { schema: { $ref: '#/components/schemas/File' } } },
	},
	responses: {
		201: {
			description: 'Created file',
			content: { '*/*': { schema: { $ref: '#/components/schemas/File' } } },
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	security: [{ cookie: [] }],
};

export default postFile;
