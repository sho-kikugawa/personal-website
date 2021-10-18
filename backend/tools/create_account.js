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
		username: username,
		password: hash
	});

	return accountData;
}

module.exports = {
	createAccount
}