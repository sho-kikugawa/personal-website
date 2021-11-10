const logger = require('../utils/logger').logger
const mongoose = require('mongoose')

function initMongo(dbParameters, schemaFiles=[]){
	mongoose.Promise = global.Promise;
	const MONGO_DB_URI = `mongodb://${dbParameters.ipAddress}:${dbParameters.portNumber}`
	
	let mongooseOptions = {
		dbName: dbParameters.dbName,
		user: dbParameters.username,
		pass: dbParameters.password
	};

	if (dbParameters.username && dbParameters.password) {
		mongooseOptions.authSource = "admin";
	}

	logger.info(`[MongoDB] Attempting to connect to ${MONGO_DB_URI}`)
	logger.debug('[MongoDB] Connecting using options %o', mongooseOptions)
	mongoose.connect(MONGO_DB_URI, mongooseOptions)
	mongoose.connection
		.once('open', () => {
			logger.info(`[MongoDB] Connected to ${MONGO_DB_URI}`)
		})
		.on('error', (error) => {
			logger.error('[MongoDB] Connection error : ', error);
		});
	schemaFiles.forEach(schemaFile => {
		require(schemaFile)
	})
}

function getConnectionState() {
	return mongoose.connection.readyState
}

function closeConnection() {
	mongoose.connection.close()
}

module.exports = {
	initMongo,
	getConnectionState,
	closeConnection
}
