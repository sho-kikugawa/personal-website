/**
 * @file Handles connecting to, disconnecting, and basic statusing of a MongoDB
 * 			server.
 */
const {logger} = require('../utils/logger')
const mongoose = require('mongoose')

/**
 * Sets up a MongoDB connection and registers the schemas.
 * @param {Object} dbParameters - Contains the database connection parameters
 * 		<br>database. Connection requires the following data members
 * 		<br>ipAddress: IP address or URL to the database
 * 		<br>portNumber: Port that the DB is listening to
 * 		<br>dbName: Name of the database to use
 * 		<br>username: Username that the database uses to authenticate the 
 * 			connection
 * 		<br>password: Password that the database uses to authenticate the 
 * 			connection
 * @param {String[]} schemaFiles - Array of strings containing the paths to the
 * 		schema files.
 */
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

/**
 * Gets the connection state to the database
 * @returns MongoDB connection state
 */
function getConnectionState() {
	return mongoose.connection.readyState
}

/**
 * Closes the MongoDB connection
 */
function closeConnection() {
	mongoose.connection.close()
}

module.exports = {
	initMongo,
	getConnectionState,
	closeConnection
}
