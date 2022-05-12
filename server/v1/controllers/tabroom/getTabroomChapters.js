// import fetch from 'isomorphic-fetch';
// import config from '../../../config';

const getTabroomChapters = {
    GET: async (req, res) => {
        // let url = `${config.TABROOM_API_URL}`;
        // url += `/caselist/chapters?person_id=${req.user.id}`;
        // url += `&caselist_key=${config.TABROOM_CASELIST_KEY}`;
        // const chapters = await fetch(url);
        // const chapters = await fetch(
        //     'http://localhost:10011/v1/caselist/chapters?person_id=17145&caselist_key=caselist-key'
        // );
        // const json = await chapters.json();
        const chapters = [
            { id: 6, name: 'Lexington HS', state: 'MA' },
            { id: 958, name: 'NFA', state: 'NY' },
        ];

        return res.status(200).json(chapters);
    },
};

getTabroomChapters.GET.apiDoc = {
    summary: 'Returns list of chapters linked to a user on Tabroom',
    operationId: 'getTabroomChapters',
    responses: {
        200: {
            description: 'Chapters',
            content: {
                '*/*': {
                    schema: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/TabroomChapter' },
                    },
                },
            },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
};

export default getTabroomChapters;
