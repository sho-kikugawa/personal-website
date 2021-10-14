const logger = require('../utils/logger').logger
const mongoose = require('mongoose')

function initMongo(schemaFiles=[]){
	mongoose.Promise = global.Promise;
	const MONGO_DB_URI = `mongodb://${process.env.DB_IP}:${process.env.DB_PORT}/${process.env.DB_NAME}`
	const MONGOOSE_OPTIONS = {
		user: process.env.DB_USERNAME,
		pass: process.env.DB_PASSWORD
	}
	logger.info(`[MongoDB] Attempting to connect to ${MONGO_DB_URI}`)
	logger.debug('[MongoDB] Connecting using options %o', MONGOOSE_OPTIONS)
	mongoose.connect(MONGO_DB_URI, MONGOOSE_OPTIONS)
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