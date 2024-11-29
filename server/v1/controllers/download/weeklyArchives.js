/* eslint-disable no-restricted-syntax, no-await-in-loop, no-continue */
/* istanbul ignore file */
// Run from CLI like:
// node --experimental-specifier-resolution=node -e 'import("./v1/controllers/download/weeklyArchives").then(m => m.weeklyArchives(true));'
// First parameter tells the script to kill the MySQL pool if running from the CLI
import fs from 'fs';
import cp from 'child_process';
import SQL from 'sql-template-strings';
import {
	S3Client,
	PutObjectCommand,
	ListObjectsV2Command,
	DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { pool, query } from '../../helpers/mysql.js';
import config from '../../../config.js';
import { debugLogger } from '../../helpers/logger.js';

export const weeklyArchives = async (killPool = false) => {
	debugLogger.info('Starting weekly open source archive...');

	const client = new S3Client({
		endpoint: `https://${config.S3_ENDPOINT}`,
		region: config.S3_REGION,
	});

	const date = new Date().toISOString().slice(0, 19).split('T')[0];

	const caselists = await query(SQL`
        SELECT DISTINCT C.name
        FROM caselists C
        WHERE C.year = (SELECT MAX(C2.year) FROM caselists C2)
    `);

	for (const caselist of caselists) {
		// Ensure the directory exists
		await fs.promises.mkdir(`${config.UPLOAD_DIR}/weekly/${caselist.name}`, {
			recursive: true,
		});

		// Create full archive, only use files still in the database to avoid including deleted files still on filesystem
		let sql = SQL`
            SELECT
                DISTINCT R.opensource
            FROM rounds R
            INNER JOIN teams T ON T.team_id = R.team_id
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON C.caselist_id = S.caselist_id
            WHERE R.opensource IS NOT NULL
                AND C.name = ${caselist.name}
        `;

		let files = await query(sql);
		debugLogger.info(
			`Found ${files.length} open source files for ${caselist.name}...`,
		);

		let command;

		if (files.length > 0) {
			files = files.map((f) => `./${f.opensource}`);

			try {
				fs.writeFileSync(
					`${config.UPLOAD_DIR}/weekly/${caselist.name}/${caselist.name}-all-${date}.txt`,
					files.join('\n'),
					'utf8',
				);
			} catch (err) {
				debugLogger.info(
					`Failed to create file list for ${caselist.name}: ${err}`,
				);
			}

			try {
				cp.execSync(
					`zip ${config.UPLOAD_DIR}/weekly/${caselist.name}/${caselist.name}-all-${date}.zip -@ < ${config.UPLOAD_DIR}/weekly/${caselist.name}/${caselist.name}-all-${date}.txt`,
					{ cwd: `${config.UPLOAD_DIR}`, stdio: 'ignore' },
				);
				debugLogger.info(`Created archive for ${caselist.name}`);
			} catch (err) {
				debugLogger.info(
					`Failed to create archive for ${caselist.name}: ${err}`,
				);
			}

			try {
				fs.unlinkSync(
					`${config.UPLOAD_DIR}/weekly/${caselist.name}/${caselist.name}-all-${date}.txt`,
				);
			} catch (err) {
				debugLogger.info(
					`Failed to delete file list for ${caselist.name}: ${err}`,
				);
			}

			try {
				command = new PutObjectCommand({
					Bucket: config.S3_BUCKET,
					Key: `weekly/${caselist.name}/${caselist.name}-all-${date}.zip`,
					Body: await fs.promises.readFile(
						`${config.UPLOAD_DIR}/weekly/${caselist.name}/${caselist.name}-all-${date}.zip`,
					),
				});
				await client.send(command);
				debugLogger.info(`Uploaded full archive to S3 for ${caselist.name}`);
			} catch (err) {
				debugLogger.info(`Failed to upload to S3 for ${caselist.name}: ${err}`);
			}

			try {
				fs.unlinkSync(
					`${config.UPLOAD_DIR}/weekly/${caselist.name}/${caselist.name}-all-${date}.zip`,
				);
			} catch (err) {
				debugLogger.info(
					`Failed to delete local archive for ${caselist.name}: ${err}`,
				);
			}

			try {
				// Delete prior full archives for this caselist
				command = new ListObjectsV2Command({
					Bucket: config.S3_BUCKET,
					Prefix: `weekly/${caselist.name}`,
				});
				const data = await client.send(command);

				const filelist = data.Contents.filter(
					(f) =>
						f.Key !==
						`weekly/${caselist.name}/${caselist.name}-all-${date}.zip`,
				)
					.filter((f) => f.Key !== `weekly/${caselist.name}`)
					.filter((f) => f.Key.includes('-all-'))
					.filter((f) => f.Key.slice(-4) === '.zip');

				filelist.forEach(async (f) => {
					command = new DeleteObjectCommand({
						Bucket: config.S3_BUCKET,
						Key: f.Key,
					});
					await client.send(command);
				});
				debugLogger.info(
					`Deleted prior full archives on S3 for ${caselist.name}`,
				);
			} catch (err) {
				debugLogger.info(
					`Failed to delete prior S3 archives for ${caselist.name}: ${err}`,
				);
			}
		}

		// Create weekly archive with just new files
		sql = SQL`
            SELECT
                DISTINCT R.opensource
            FROM rounds R
            INNER JOIN teams T ON T.team_id = R.team_id
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON C.caselist_id = S.caselist_id
            WHERE R.opensource IS NOT NULL
                AND C.name = ${caselist.name}
                AND R.updated_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)
        `;

		files = await query(sql);
		debugLogger.info(
			`Found ${files.length} open source files for ${caselist.name} in the last week...`,
		);

		if (files.length > 0) {
			files = files.map((f) => `./${f.opensource}`);

			try {
				fs.writeFileSync(
					`${config.UPLOAD_DIR}/weekly/${caselist.name}/${caselist.name}-weekly-${date}.txt`,
					files.join('\n'),
					'utf8',
				);
			} catch (err) {
				debugLogger.info(
					`Failed to create weekly file list for ${caselist.name}: ${err}`,
				);
			}

			try {
				cp.execSync(
					`zip ${config.UPLOAD_DIR}/weekly/${caselist.name}/${caselist.name}-weekly-${date}.zip -@ < ${config.UPLOAD_DIR}/weekly/${caselist.name}/${caselist.name}-weekly-${date}.txt`,
					{ cwd: `${config.UPLOAD_DIR}`, stdio: 'ignore' },
				);
				debugLogger.info(`Created weekly archive for ${caselist.name}`);
			} catch (err) {
				debugLogger.info(
					`Failed to create weekly archive for ${caselist.name}: ${err}`,
				);
			}

			try {
				fs.unlinkSync(
					`${config.UPLOAD_DIR}/weekly/${caselist.name}/${caselist.name}-weekly-${date}.txt`,
				);
			} catch (err) {
				debugLogger.info(
					`Failed to delete weekly file list for ${caselist.name}: ${err}`,
				);
			}

			try {
				command = new PutObjectCommand({
					Bucket: config.S3_BUCKET,
					Key: `weekly/${caselist.name}/${caselist.name}-weekly-${date}.zip`,
					Body: await fs.promises.readFile(
						`${config.UPLOAD_DIR}/weekly/${caselist.name}/${caselist.name}-weekly-${date}.zip`,
					),
				});
				await client.send(command);
				debugLogger.info(`Uploaded weekly archive to S3 for ${caselist.name}`);
			} catch (err) {
				debugLogger.info(
					`Failed to upload weekly to S3 for ${caselist.name}: ${err}`,
				);
			}

			try {
				fs.unlinkSync(
					`${config.UPLOAD_DIR}/weekly/${caselist.name}/${caselist.name}-weekly-${date}.zip`,
				);
			} catch (err) {
				debugLogger.info(
					`Failed to delete local weekly archive for ${caselist.name}: ${err}`,
				);
			}
		}
	}

	if (killPool) {
		pool.end();
	}
	debugLogger.info('Finished weekly open source archive.');
};

export default weeklyArchives;
