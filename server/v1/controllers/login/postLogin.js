import ldap from 'ldapjs';

const postLogin = {
    POST: async (req, res) => {
        const username = req.body.username;
        const password = req.body.password;

        const client = ldap.createClient({
            url: ['ldaps://ldap.tabroom.com:636'],
        });

        client.bind(`uid=${username},ou=users,dc=tabroom,dc=com}`, password, (err) => {
            if (err) { console.log(err); }
            return res.status(201).json({ message: 'Successfully logged in' });
        });

        client.on('error', (err) => {
            console.log(err);
            return res.status(400).json({ message: 'LDAP error', error: err });
        });
    },
};

postLogin.POST.apiDoc = {
    summary: 'Logs in',
    operationId: 'postLogin',
    requestBody: {
        description: 'The username and password',
        required: true,
        content: { '*/*': { schema: { $ref: '#/components/schemas/Login' } } },
    },
    responses: {
        201: {
            description: 'Logged in',
            content: { '*/*': { schema: { $ref: '#/components/schemas/School' } } },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
};

export default postLogin;
