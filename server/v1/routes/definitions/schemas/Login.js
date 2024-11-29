const Login = {
	type: 'object',
	properties: {
		username: { type: 'string' },
		password: { type: 'string' },
		remember: { type: 'boolean' },
	},
};

export default Login;
