const {generateKey} = require('../utils/crypto');
class RenderData {
	constructor(title, req) {
		this.headTitle = `${title} | Sho and Tell`;
		this.title = `${title}`;
		this.loggedIn = 'editor' in req.session;
		this.nonce = generateKey();
	}
}

/** Wraps running the controller function that handles a route with something
 *	that can catch errors and redirect the error the Express's error handling.
*/
function handler(controllerFunc, req, res, next) {
	controllerFunc(req, res, next).catch(err => next(err));
}

function renderPage(pagePath, data, res) {
	data.scriptNonce = res.locals.scriptNonce;
	data.styleNonce = res.locals.styleNonce;
	res.render(pagePath, data);
}

module.exports = {
	handler,
	renderPage,
	RenderData
};