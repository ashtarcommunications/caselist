import 'dotenv/config';
import fs from 'fs';
import chokidar from 'chokidar';
import { fetch } from '@speechanddebate/nsda-js-utils';

// Initialize watcher.
const watcher = chokidar.watch(process.env.UPLOAD_DIR, {
    ignored: /(^|[/\\])\../, // ignore dotfiles
    persistent: true,
    awaitWriteFinish: true,
});

// Something to use when events are received.
const log = console.log.bind(console);

// Add event listeners.
watcher
.on('add', async (path) => {
    log(`File ${path} has been added`);
    // if (path.indexOf('test') < 0) { return false; }
    const file = fs.readFileSync(path);
    const meta = await fetch(
        'http://localhost:9998/meta',
        {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
            },
            body: file,
        }
    );
    const metaJSON = await meta.json();

    const text = await fetch(
        'http://localhost:9998/tika',
        {
            method: 'PUT',
            headers: {
                Accept: 'text/plain',
            },
            body: file,
        }
    );
    const textText = await text.text();

    const body = JSON.stringify([{ ...metaJSON, id: path, content: textText }]);

    const post = await fetch(
        'http://localhost:8983/solr/caselist/update?commit=true',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body,
        }
    );
    console.log(await post.json());
})
.on('change', path => log(`File ${path} has been changed`))
.on('unlink', path => log(`File ${path} has been removed`))
.on('error', error => log(`Watcher error: ${error}`));
