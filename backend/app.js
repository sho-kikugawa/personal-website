/**
 * @file Main app configuration.
 */
const path = require('path');

/* Setup environment ********************************************************/
const config = require('./config/config')();
const { logger, formatJson } = require('./utils/logger');
logger.debug(`Config: ${formatJson(config)}`);

/* Setup DB ******************************************************************/
/* Build the database schema file list */
const mongoLoader = require('./loaders/mongo-db');
const redisLoader = require('./loaders/redis-db');
mongoLoader.setup(config.database.mongo);
redisLoader.startClient(config.database.redis, 'Editors');

/* Create Express Instance ***************************************************/
const express = require('express');
let app = express();

/* Load and setup security packages ******************************************/
require('./loaders/security')(app, config);

/* Load and setup server middleware ******************************************/
const clientPaths = { 
	views: path.join(__dirname, '../client/views'),
	public: path.join(__dirname, '../client/public')
};
require('./loaders/server-middleware')(app, clientPaths);

/* Load and setup sessioning *************************************************/
require('./loaders/session')(app, config.session, redisLoader.getClient('Editors'));

/* Setup Routes **************************************************************/
const staticRoutesPath = path.join(__dirname, 'routes');
require('./loaders/routes')(app, staticRoutesPath);

/** Create and launch the server *********************************************/
require('./loaders/server')(app, config);