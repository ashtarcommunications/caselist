import status from '../controllers/status/status';

import getWikis from '../controllers/wikis/getWikis';

export default [
    { path: '/status', module: status },

    { path: '/wikis', module: getWikis },

    { path: '/wikis/{wiki_id}/schools', module: status },
];
