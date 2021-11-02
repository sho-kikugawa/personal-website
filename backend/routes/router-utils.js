function handler(controllerFunc, req, res, next) {
	controllerFunc(req, res)
		.catch(err => next(err));
}

module.exports = {
	handler
};