/**
 * @file Controller for handling all routes pertaining to editor functions,
 * 		including logging in and creating, editing, and deleting blogs.
 */
require('../models/editor-schema');
const mongoose = require('mongoose');
const model = mongoose.model('Editor')
const { logger, formatJson } = require(`../utils/logger`);
const { verifyPassword } = require(`../utils/crypto`);

/**
 * Handles a post request to login.
 * @param {Object} req - Request object (from Express). Uses the body object to
 * 		get the username and password.
 * @param {Object} res - Response object (from Express)
 */
async function editorLogin(username, password) {
	let editorData = await model.findOne({'username': username});
	if (editorData !== null && await verifyPassword(editorData.password, password) === true) {
		logger.debug(`${formatJson(editorData)}`);
		return editorData;
	}
	else {
		return null;
	}
}

module.exports = {
	editorLogin,
};