class RenderData {
	constructor(title, req) {
		this.headTitle = `${title} | Sho and Tell`;
		this.title = `${title}`;
		this.loggedIn = 'editor' in req.session;
	}
}

/** Wraps running the controller function that handles a route with something
 *	that can catch errors and redirect the error the Express's error handling.
*/
function handler(controllerFunc, req, res, next) {
	controllerFunc(req, res, next).catch(err => next(err));
}

module.exports = {
	handler,
	RenderData
};