import 'dotenv/config';
import fs from 'fs';
import { fetch } from '@speechanddebate/nsda-js-utils';

const test = async () => {
    const path = '/home/hardy/projects/caselist/server/uploads/test.docx';
    const file = fs.readFileSync(path);
    console.log(file);
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
};

test();
