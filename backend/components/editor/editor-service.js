const mongoose = require('mongoose');
const model = mongoose.model('Editor');
const logger = require(`../../utils/logger`).logger;
const cryptoUtil = require('../../utils/crypto');

async function editorLogin(username, password) {
	const queryData = { username: username };
	const filterData = 'password username';
	let accountData = await model.findOne(queryData, filterData).exec();
	let validLogin = false;

	if (accountData !== null) {
		validLogin = await cryptoUtil.verifyPassword(accountData.password, password);
	}
	
	if (validLogin === true) {
		return accountData;
	}
	else {
		return null;
	}
}

module.exports = {
	editorLogin,
}