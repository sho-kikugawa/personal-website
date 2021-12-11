/**
 * @file Controller for handling all routes pertaining to editor functions,
 * 		including logging in and creating, editing, and deleting blogs.
 */
const model = new (require('./mongo-dal').MongooseDal)('Editor');
const { logger, formatJson } = require(`../utils/logger`);
const { verifyPassword } = require(`../utils/crypto`);

/**
 * Handles a post request to login.
 * @param {Object} req - Request object (from Express). Uses the body object to
 * 		get the username and password.
 * @param {Object} res - Response object (from Express)
 */
async function editorLogin(username, password) {
	let editorData = await model.getOne({"username": username});
	if (editorData === null) {
		return editorData;
	}
	logger.debug(`${formatJson(editorData)}`)
	let passwordMatch = false;
	passwordMatch = await verifyPassword(editorData.password, password);
	if(passwordMatch === true) {
		return editorData;
	}
	else {
		return null;
	}
}

module.exports = {
	editorLogin,
};