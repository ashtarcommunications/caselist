/* istanbul ignore file */
const errorHandler = (err, req, res, next) => {
	// Delegate to default express error handler if headers are already sent
	if (res.headersSent) {
		return next(err);
	}

	// Validation error object from OpenAPI
	if (err.status || err.errors) {
		if (err.status === 400) {
			return res.status(err.status).json({
				message: 'Validation error',
				errors: err.errors,
				logCorrelationId: req.uuid,
			});
		}
		if (err.status === 401) {
			return res.status(err.status).json({ message: err.message });
		}
	}

	// Default to a 500 error
	return res.status(500).json({
		message: err.message || 'Internal server error',
		logCorrelationId: req.uuid,
	});
};

export default errorHandler;
