// #!/usr/bin/env node
// Invoke from CLI like:
// node --experimental-specifier-resolution=node v1/migration/migrateOpenEv.js
/* istanbul ignore file */

import Bottleneck from 'bottleneck';
import { fetch } from '@speechanddebate/nsda-js-utils';
import { parseString } from 'xml2js';
import fs from 'fs';
import { cwd } from 'process';
import SQL from 'sql-template-strings';
import { query, pool } from '../helpers/mysql';

// Promisify xml2js
const parseXML = (xml) => {
    return new Promise((resolve, reject) => {
        parseString(xml, (err, result) => {
            if (err) { reject(err); }
            resolve(result);
        });
    });
};

const shortTag = {
    Affirmatives: 'aff',
    'Case Negatives': 'neg',
    Counterplans: 'cp',
    Disadvantages: 'da',
    'Impact Files': 'imp',
    'Kritik Answers': 'atk',
    Kritiks: 'k',
    'Lincoln Douglas': 'ld',
    Politics: 'pol',
    'Public Forum': 'pf',
    Theory: 'th',
    Topicality: 't',
};

const convertCampName = (camp) => {
    if (camp === 'Baylor') { return 'BDPW'; }
    if (camp === 'Berkeley') { return 'CNDI'; }
    if (camp === 'Emory') { return 'ENDI'; }
    if (camp === 'Georgetown') { return 'GDS'; }
    if (camp === 'Georgia') { return 'UGA'; }
    if (camp === 'Gonzaga') { return 'GDI'; }
    if (camp === 'Harvard') { return 'HDC'; }
    if (camp === 'Hoya-Spartan Scholars') { return 'HSS'; }
    if (camp === 'Michigan7') { return 'UM7'; }
    if (camp === 'MichiganClassic') { return 'UMC'; }
    if (camp === 'MoneyGram Foundation') { return 'MGF'; }
    if (camp === 'Northwestern') { return 'NHSI'; }
    if (camp === 'Samford') { return 'SSDI'; }
    if (camp === 'Wake') { return 'RKS'; }
    if (camp === 'Wyoming') { return 'WYO'; }
    return camp;
};

const migrate = async () => {
    const years = ['2013'];

    const pagesLimiter = new Bottleneck({ maxConcurrent: 1, minTime: 50 });
    const objectsLimiter = new Bottleneck({ maxConcurrent: 1, minTime: 50 });
    const fileLimiter = new Bottleneck({ maxConcurrent: 1, minTime: 50 });

    try {
        /* eslint-disable no-restricted-syntax */
        for (const year of years) {
            console.log(`Starting migration of Open Ev ${year}...`);
            const baseURL = `https://openev.debatecoaches.org/rest/wikis/openev/spaces/${year}/pages`;
            /* eslint-disable no-await-in-loop */
            /* eslint-disable no-loop-func */
            await pagesLimiter.schedule(async () => {
                let response = await fetch(baseURL, { mode: 'cors', headers: { Accept: 'application/xml', 'Content-Type': 'application/xml' } });
                let text = await response.text();
                let xml = await parseXML(text);
                const pages = xml?.pages?.pageSummary
                    ?.map(p => p.name?.[0]) ?? [];

                for (const page of pages) {
                    console.log(`Migrating ${page}...`);
                    await objectsLimiter.schedule(async () => {
                        const objectsURL = `${baseURL}/${page}/objects/AttachedFileClass`;
                        response = await fetch(objectsURL, { mode: 'cors', headers: { Accept: 'application/xml', 'Content-Type': 'application/xml' } });
                        text = await response.text();
                        xml = await parseXML(text);

                        const objects = xml?.objects?.objectSummary
                            ?.map(t => t.number[0]) ?? [];

                        console.log(`Found ${objects.length} objects in ${page}...`);

                        // Array to track already downloaded files so we can skip duplicate objects
                        const downloadedFiles = [];

                        for (const obj of objects) {
                            await fileLimiter.schedule(async () => {
                                const fileInfoURL = `${baseURL}/${page}/objects/AttachedFileClass/${obj}`;
                                response = await fetch(fileInfoURL, { mode: 'cors', headers: { Accept: 'application/xml', 'Content-Type': 'application/xml' } });
                                text = await response.text();
                                xml = await parseXML(text);
                                const fileInfo = xml?.object?.property;
                                const f = {};
                                fileInfo.forEach(prop => {
                                    if (prop.$.name === 'Camp') { f.camp = prop.value[0]; }
                                    if (prop.$.name === 'FileName') { f.filename = prop.value[0]; }
                                    if (prop.$.name === 'FileName') { f.title = prop.value[0].split('.')[0]; }
                                    if (prop.$.name === 'Lab') { f.lab = prop.value[0]; }
                                    if (prop.$.name === 'Tags') { f.tags = prop.value[0]; }
                                    if (prop.$.name === 'URL') { f.url = prop.value[0]; }
                                });

                                // Skip if already downloaded
                                if (downloadedFiles.indexOf(f.url) > -1) { return false; }

                                downloadedFiles.push(f.url);

                                const splitTags = f.tags.split(',');
                                const jsonTags = {};
                                splitTags.forEach(t => {
                                    if (!t) { return false; }
                                    jsonTags[shortTag[t]] = true;
                                });

                                f.tags = JSON.stringify(jsonTags);

                                let path = null;
                                let fullPath = null;
                                if (f.url) {
                                    console.log(`Downloading ${f.url}...`);
                                    const file = await fetch(f.url, { mode: 'cors' });
                                    const arrayBuffer = await file.arrayBuffer();
                                    const buffer = Buffer.from(arrayBuffer);
                                    try {
                                        path = `openev/${year}/${convertCampName(f.camp?.replace(' ', ''))}`;
                                        fullPath = `${path}/${f.filename}`;
                                        await fs.promises.mkdir(
                                            `${cwd()}/uploads/${path}`,
                                            { recursive: true }
                                        );
                                        await fs.promises.writeFile(
                                            `${cwd()}/uploads/${fullPath}`,
                                            buffer,
                                        );
                                    } catch (err) {
                                        console.log(err);
                                    }
                                }

                                await query(SQL`
                                    INSERT INTO openev (name, path, year, camp, lab, tags)
                                    VALUES (
                                        ${f.title},
                                        ${fullPath},
                                        ${year},
                                        ${convertCampName(f.camp)},
                                        ${f.lab},
                                        ${f.tags}
                                    )
                                `);
                            });
                        }
                    });
                }
            });
        }

        pool.end();

        return true;
    } catch (err) {
        console.log(err);
        pool.end();
        return err;
    }
};

migrate();

export default migrate;
