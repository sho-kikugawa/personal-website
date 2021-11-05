/** Wraps running the controller function that handles a route with something
 *	that can catch errors and redirect the error the Express's error handling.
*/
function handler(controllerFunc, req, res, next) {
	controllerFunc(req, res).catch(err => next(err));
}

module.exports = {
	handler
};