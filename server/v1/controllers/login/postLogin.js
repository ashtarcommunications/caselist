import ldap from 'ldapjs';

const postLogin = {
    POST: async (req, res) => {
        const username = req.body.username;
        const password = req.body.password;

        const client = ldap.createClient({
            url: ['ldaps://ldap.tabroom.com:636'],
        });

        // TODO - better error handling
        try {
            client.bind(`uid=${username},ou=users,dc=tabroom,dc=com`, password, (err) => {
                if (err) { throw err; }
                return res.status(201).json({ message: 'Successfully logged in' });
            });
        } catch (err) {
            console.log(`LDAP error: ${err}`);
            return res.status(401).json({ message: 'Authentication failed', error: err });
        }

        // client.on('error', (err) => {
        //     console.log(err);
        //     return res.status(500).json({ message: 'Error connecting to LDAP', error: err });
        // });
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
