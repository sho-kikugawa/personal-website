/* Grab all dependencies *****************************************************/
const schemaFiles = ['../components/editor/editor-schema'];
const dbParams = {
	ipAddress: "localhost",
	portNumber: 27017, 
	dbName: "sk-site", 
	username: "",
	password: ""
}
require('../dbs/mongo-db').initMongo(dbParams, schemaFiles);

async function createAccount(username, password) {
	const service = require('../components/editor/editor-service');
	return await service.createAccount(username, password);
}

async function deleteAccount(username) {
	const service = require('../components/editor/editor-service');
	return await service.deleteAccount(username);
}

module.exports = {
	createAccount,
	deleteAccount
}