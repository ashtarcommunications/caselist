// #!/usr/bin/env node
// Invoke from CLI like:
// node --experimental-specifier-resolution=node v1/migration/migrateCaselists.js
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

const month = {
    Jan: '01',
    Feb: '02',
    Mar: '03',
    Apr: '04',
    May: '05',
    Jun: '06',
    Jul: '07',
    Aug: '08',
    Sep: '09',
    Oct: '10',
    Nov: '11',
    Dec: '12',
};

const migrate = async () => {
    const caselists = ['opencaselist14'];
    const excludedSpaces = ['XWiki', 'Sandbox', 'Panels', 'Main', 'Caselist'];

    const schoolsLimiter = new Bottleneck({ maxConcurrent: 1, minTime: 50 });
    const teamsLimiter = new Bottleneck({ maxConcurrent: 1, minTime: 50 });
    const teamInfoLimiter = new Bottleneck({ maxConcurrent: 1, minTime: 50 });
    const roundsLimiter = new Bottleneck({ maxConcurrent: 1, minTime: 50 });
    const affRoundInfoLimiter = new Bottleneck({ maxConcurrent: 1, minTime: 50 });
    const negRoundInfoLimiter = new Bottleneck({ maxConcurrent: 1, minTime: 50 });
    const affCitesInfoLimiter = new Bottleneck({ maxConcurrent: 1, minTime: 50 });
    const negCitesInfoLimiter = new Bottleneck({ maxConcurrent: 1, minTime: 50 });

    console.log('Starting caselist migration...');
    try {
        /* eslint-disable no-restricted-syntax */
        for (const caselist of caselists) {
            console.log(`Starting migration of caselist ${caselist}`);
            const baseURL = `https://opencaselist.paperlessdebate.com/rest/wikis/${caselist}/spaces/`;
            /* eslint-disable no-await-in-loop */
            /* eslint-disable no-loop-func */
            await schoolsLimiter.schedule(async () => {
                let response = await fetch(baseURL, { mode: 'cors', headers: { Accept: 'application/xml', 'Content-Type': 'application/xml' } });
                let text = await response.text();
                let xml = await parseXML(text);
                const schools = xml?.spaces?.space
                    ?.filter(s => excludedSpaces.indexOf(s.name?.[0]) === -1)
                    ?.map(s => s.name?.[0]);

                console.log(`Found ${schools.length} schools...`);

                for (const school of schools) {
                    console.log(`Processing school ${school}...`);
                    await teamsLimiter.schedule(async () => {
                        const teamsURL = `${baseURL}${encodeURIComponent(school)}/pages/WebHome/objects`;
                        response = await fetch(teamsURL, { mode: 'cors', headers: { Accept: 'application/xml', 'Content-Type': 'application/xml' } });
                        text = await response.text();
                        xml = await parseXML(text);

                        const state = xml?.objects?.objectSummary
                            ?.filter(t => t.className[0] === 'Caselist.StateClass')
                            ?.map(t => t.headline[0])[0] || null;

                        const newSchool = await query(SQL`
                            INSERT INTO schools (caselist_id, name, display_name, state)
                            SELECT
                                caselist_id,
                                ${school.replaceAll(' ', '')},
                                ${school},
                                ${state}
                            FROM caselists WHERE name = ${caselist}
                        `);

                        const teams = xml?.objects?.objectSummary
                            ?.filter(t => t.className[0] === 'Caselist.TeamClass')
                            ?.map(t => ({ name: t.headline[0].split('.')[1], number: t.number[0] }));

                        console.log(`Found ${teams.length} teams for ${school}`);

                        for (const team of teams) {
                            console.log(`Processing team ${team}...`);
                            await teamInfoLimiter.schedule(async () => {
                                const teamInfoURL = `${baseURL}${encodeURIComponent(school)}/pages/WebHome/objects/Caselist.TeamClass/${team.number}/`;
                                response = await fetch(teamInfoURL, { mode: 'cors', headers: { Accept: 'application/xml', 'Content-Type': 'application/xml' } });
                                text = await response.text();
                                xml = await parseXML(text);
                                const teamInfo = xml?.object?.property;
                                const t = {};
                                teamInfo.forEach(prop => {
                                    if (prop.$.name === 'AffPage') { t.aff = prop.value[0].split('.')[1]; }
                                    if (prop.$.name === 'NegPage') { t.neg = prop.value[0].split('.')[1]; }
                                    if (prop.$.name === 'Debater1First') { t.debater1_first = prop.value[0]; }
                                    if (prop.$.name === 'Debater1Last') { t.debater1_last = prop.value[0]; }
                                    if (prop.$.name === 'Debater2First') { t.debater2_first = prop.value[0]; }
                                    if (prop.$.name === 'Debater2Last') { t.debater2_last = prop.value[0]; }
                                });
                                t.name = ``;
                                t.display_name = `${school} `;
                                for (let i = 0; i < 2; i++) {
                                    const debater = `debater${i + 1}_last`;
                                    t.name += `${t[debater]?.slice(0, 2)}`;
                                    t.display_name += `${t[debater]?.slice(0, 2)}`;
                                }

                                const newTeam = await query(SQL`
                                    INSERT INTO teams (school_id, name, display_name, debater1_first, debater1_last, debater2_first, debater2_last)
                                    VALUES (
                                        ${newSchool.insertId},
                                        ${t.name},
                                        ${t.display_name},
                                        ${t.debater1_first},
                                        ${t.debater1_last},
                                        ${t.debater2_first},
                                        ${t.debater2_last}
                                    )
                               `);

                                await roundsLimiter.schedule(async () => {
                                    const affRoundsURL = `${baseURL}${encodeURIComponent(school)}/pages/${encodeURIComponent(t.aff)}/objects`;
                                    response = await fetch(affRoundsURL, { mode: 'cors', headers: { Accept: 'application/xml', 'Content-Type': 'application/xml' } });
                                    text = await response.text();
                                    xml = await parseXML(text);
                                    const affRounds = xml?.objects?.objectSummary
                                        ?.filter(r => r.className[0] === 'Caselist.RoundClass')
                                        ?.map(r => r.number[0]);

                                    console.log(`Found ${affRounds.length} aff rounds for ${team}...`);
                                    for (const round of affRounds) {
                                        await affRoundInfoLimiter.schedule(async () => {
                                            const roundInfoURL = `${baseURL}${encodeURIComponent(school)}/pages/${encodeURIComponent(t.aff)}/objects/Caselist.RoundClass/${round}/`;
                                            response = await fetch(roundInfoURL, { mode: 'cors', headers: { Accept: 'application/xml', 'Content-Type': 'application/xml' } });
                                            text = await response.text();
                                            xml = await parseXML(text);
                                            const roundInfo = xml?.object?.property;
                                            const r = {
                                                side: 'A',
                                                cites: [],
                                            };

                                            roundInfo.forEach(prop => {
                                                if (prop.$.name === 'Tournament') { r.tournament = prop.value[0]; }
                                                if (prop.$.name === 'Round') { r.round = prop.value[0]; }
                                                if (prop.$.name === 'Opponent') { r.opponent = prop.value[0]; }
                                                if (prop.$.name === 'Judge') { r.judge = prop.value[0]; }
                                                if (prop.$.name === 'RoundReport') { r.report = prop.value[0]; }
                                                if (prop.$.name === 'OpenSource') { r.opensource = prop.value[0]; }
                                                if (prop.$.name === 'Video') { r.video = prop.value[0]; }
                                                if (prop.$.name === 'Cites' && prop.value[0]?.length > 0) { r.cites = prop.value[0]?.split(',') || []; }
                                                if (prop.$.name === 'EntryDate') {
                                                    const parseDate = prop.value[0].split(' ');
                                                    r.created_at = `${parseDate[5]}-${month[parseDate[1]]}-${parseDate[2]} ${parseDate[3]}`;
                                                }
                                            });

                                            let path = null;
                                            let fullPath = null;
                                            if (r.opensource) {
                                                const file = await fetch(r.opensource, { mode: 'cors' });
                                                const arrayBuffer = await file.arrayBuffer();
                                                const buffer = Buffer.from(arrayBuffer);
                                                const filename = r.opensource
                                                    ?.split('#')
                                                    ?.shift()
                                                    ?.split('?')
                                                    ?.shift()
                                                    ?.split('/')
                                                    ?.pop();
                                                try {
                                                    path = `${caselist}/${school.replace(' ', '')}/${t.name}`;
                                                    fullPath = `${path}/${filename}`;
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

                                            const newAffRound = await query(SQL`
                                                INSERT INTO rounds (team_id, tournament, side, round, opponent, judge, report, opensource, video, created_at)
                                                VALUES (
                                                    ${newTeam.insertId},
                                                    ${r.tournament},
                                                    'A',
                                                    ${r.round},
                                                    ${r.opponent},
                                                    ${r.judge},
                                                    ${r.report},
                                                    ${fullPath},
                                                    ${r.video},
                                                    ${r.created_at}
                                                )
                                            `);

                                            for (const cite of r.cites) {
                                                await affCitesInfoLimiter.schedule(async () => {
                                                    const citesInfoURL = `${baseURL}${encodeURIComponent(school)}/pages/${encodeURIComponent(t.aff)}/objects/Caselist.CitesClass/${cite}/`;
                                                    response = await fetch(citesInfoURL, { mode: 'cors', headers: { Accept: 'application/xml', 'Content-Type': 'application/xml' } });
                                                    text = await response.text();
                                                    xml = await parseXML(text);
                                                    const citesInfo = xml?.object?.property;
                                                    const c = {};
                                                    citesInfo.forEach(prop => {
                                                        if (prop.$.name === 'Title') { c.title = prop.value[0]; }
                                                        if (prop.$.name === 'Cites') { c.cites = prop.value[0]; }
                                                        if (prop.$.name === 'EntryDate') {
                                                            const parseDate = prop.value[0].split(' ');
                                                            c.created_at = `${parseDate[5]}-${month[parseDate[1]]}-${parseDate[2]} ${parseDate[3]}`;
                                                        }
                                                    });
                                                    await query(SQL`
                                                        INSERT INTO cites (round_id, title, cites, created_at)
                                                        VALUES (
                                                            ${newAffRound.insertId},
                                                            ${c.title},
                                                            ${c.cites},
                                                            ${c.created_at}
                                                        )
                                                    `);
                                                });
                                            }
                                        });
                                    }

                                    const negRoundsURL = `${baseURL}${encodeURIComponent(school)}/pages/${encodeURIComponent(t.neg)}/objects`;
                                    response = await fetch(negRoundsURL, { mode: 'cors', headers: { Accept: 'application/xml', 'Content-Type': 'application/xml' } });
                                    text = await response.text();
                                    xml = await parseXML(text);
                                    const negRounds = xml?.objects?.objectSummary
                                        ?.filter(r => r.className[0] === 'Caselist.RoundClass')
                                        ?.map(r => r.number[0]);

                                    console.log(`Found ${negRounds.length} neg rounds for ${team}...`);
                                    for (const round of negRounds) {
                                        await negRoundInfoLimiter.schedule(async () => {
                                            const roundInfoURL = `${baseURL}${encodeURIComponent(school)}/pages/${encodeURIComponent(t.neg)}/objects/Caselist.RoundClass/${round}/`;
                                            response = await fetch(roundInfoURL, { mode: 'cors', headers: { Accept: 'application/xml', 'Content-Type': 'application/xml' } });
                                            text = await response.text();
                                            xml = await parseXML(text);
                                            const roundInfo = xml?.object?.property;
                                            const r = {
                                                side: 'N',
                                                cites: [],
                                            };
                                            roundInfo.forEach(prop => {
                                                if (prop.$.name === 'Tournament') { r.tournament = prop.value[0]; }
                                                if (prop.$.name === 'Round') { r.round = prop.value[0]; }
                                                if (prop.$.name === 'Opponent') { r.opponent = prop.value[0]; }
                                                if (prop.$.name === 'Judge') { r.judge = prop.value[0]; }
                                                if (prop.$.name === 'RoundReport') { r.report = prop.value[0]; }
                                                if (prop.$.name === 'OpenSource') { r.opensource = prop.value[0]; }
                                                if (prop.$.name === 'Video') { r.video = prop.value[0]; }
                                                if (prop.$.name === 'Cites' && prop.value[0]?.length > 0) { r.cites = prop.value[0]?.split(',') || []; }
                                                if (prop.$.name === 'EntryDate') {
                                                    const parseDate = prop.value[0].split(' ');
                                                    r.created_at = `${parseDate[5]}-${month[parseDate[1]]}-${parseDate[2]} ${parseDate[3]}`;
                                                }
                                            });

                                            let path = null;
                                            let fullPath = null;
                                            if (r.opensource) {
                                                const file = await fetch(r.opensource, { mode: 'cors' });
                                                const arrayBuffer = await file.arrayBuffer();
                                                const buffer = Buffer.from(arrayBuffer);
                                                const filename = r.opensource
                                                    ?.split('#')
                                                    ?.shift()
                                                    ?.split('?')
                                                    ?.shift()
                                                    ?.split('/')
                                                    ?.pop();
                                                try {
                                                    path = `${caselist}/${school.replace(' ', '')}/${t.name}`;
                                                    fullPath = `${path}/${filename}`;
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

                                            const newNegRound = await query(SQL`
                                                INSERT INTO rounds (team_id, tournament, side, round, opponent, judge, report, video, created_at)
                                                VALUES (
                                                    ${newTeam.insertId},
                                                    ${r.tournament},
                                                    'N',
                                                    ${r.round},
                                                    ${r.opponent},
                                                    ${r.judge},
                                                    ${r.report},
                                                    ${r.video},
                                                    ${r.created_at}
                                                )
                                            `);

                                            for (const cite of r.cites) {
                                                await negCitesInfoLimiter.schedule(async () => {
                                                    const citesInfoURL = `${baseURL}${encodeURIComponent(school)}/pages/${encodeURIComponent(t.neg)}/objects/Caselist.CitesClass/${cite}/`;
                                                    response = await fetch(citesInfoURL, { mode: 'cors', headers: { Accept: 'application/xml', 'Content-Type': 'application/xml' } });
                                                    text = await response.text();
                                                    xml = await parseXML(text);
                                                    const citesInfo = xml?.object?.property;
                                                    const c = {};
                                                    citesInfo.forEach(prop => {
                                                        if (prop.$.name === 'Title') { c.title = prop.value[0]; }
                                                        if (prop.$.name === 'Cites') { c.cites = prop.value[0]; }
                                                        if (prop.$.name === 'EntryDate') {
                                                            const parseDate = prop.value[0].split(' ');
                                                            c.created_at = `${parseDate[5]}-${month[parseDate[1]]}-${parseDate[2]} ${parseDate[3]}`;
                                                        }
                                                    });
                                                    await query(SQL`
                                                        INSERT INTO cites (round_id, title, cites, created_at)
                                                        VALUES (
                                                            ${newNegRound.insertId},
                                                            ${c.title},
                                                            ${c.cites},
                                                            ${c.created_at}
                                                        )
                                                    `);
                                                });
                                            }
                                        });
                                    }
                                });
                            });
                        }
                    });
                }
            });
        }

        console.log('Finished migration.');
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
