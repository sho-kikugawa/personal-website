/* Grab all dependencies *****************************************************/
const cryptoUtil = require('../utils/crypto');
const schemaFiles = ['../components/editor/editor-schema'];
const dbParams = {
	ipAddress: "localhost",
	portNumber: 27017, 
	dbName: "Test", 
	username: "",
	password: ""
}
require('../dbs/mongo-db').initMongo(dbParams, schemaFiles);

async function createAccount(username, password) {
	const mongoose = require('mongoose');
	const model = mongoose.model('Editor');
	const salt = cryptoUtil.generateKey();
	const hash = await cryptoUtil.getPasswordHash(password, salt);
	const accountData = await model.create({
		editorId: cryptoUtil.generateKey(),
		username: username,
		password: hash
	});

	return accountData;
}

async function deleteAccount(username) {
	const mongoose = require('mongoose');
	const model = mongoose.model('Editor');
	const deleteResult = await model.deleteOne({username: username});

	return deleteResult;
}

module.exports = {
	createAccount,
	deleteAccount
}