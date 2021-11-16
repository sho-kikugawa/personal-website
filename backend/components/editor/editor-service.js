const mongoose = require('mongoose');
const model = mongoose.model('Editor');
const logger = require(`../../utils/logger`).logger;
const cryptoUtil = require('../../utils/crypto');

/**
 * Creates an account.
 * @param {String} username - Username of the account
 * @param {String} password - Password of the account
 * @returns A Document if the account was created. Null otherwise.
 */
async function createAccount(username, password) {
	const salt = cryptoUtil.generateKey();
	const hash = await cryptoUtil.getPasswordHash(password, salt);
	const accountData = await model.create({
		editorId: cryptoUtil.generateKey(),
		username: username,
		password: hash
	});

	return accountData;
}

/**
 * Takes a username and password to log into an account.
 * @param {String} username - Username of the account
 * @param {String} password - Password of the account
 * @returns A document if the login is successful, otherwise null.
 */
async function editorLogin(username, password) {
	const queryData = { username: username };
	const filterData = 'password username editorId';
	let accountData = await model.findOne(queryData, filterData).exec();
	let validLogin = false;

	if (accountData !== null) {
		validLogin = await cryptoUtil.verifyPassword(accountData.password, password);
	}
	
	if (validLogin === true) {
		accountData.password = null;
		return accountData;
	}
	else {
		return null;
	}
}

/**
 * Deletes an account based on the username.
 * @param {String} username - Username of the account
 * @returns An object containing the results of deleting the account
 */
async function deleteAccount(username) {
	const deleteResult = await model.deleteOne({username: username});
	return deleteResult;
}


module.exports = {
	createAccount,
	editorLogin,
	deleteAccount
}