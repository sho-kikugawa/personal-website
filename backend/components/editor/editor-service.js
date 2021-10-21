const mongoose = require('mongoose');
const model = mongoose.model('Editor');
const logger = require(`../../utils/logger`).logger;
const cryptoUtil = require('../../utils/crypto');

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

async function deleteAccount(username) {
	const deleteResult = await model.deleteOne({username: username});
	return deleteResult;
}


module.exports = {
	createAccount,
	editorLogin,
	deleteAccount
}