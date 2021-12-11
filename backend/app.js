/**
 * @file Main app configuration.
 */
const fs = require('fs');
const path = require('path');

/* Setup environment ********************************************************/
const config = require('./config/config')();
const { logger, formatJson } = require('./utils/logger');
logger.debug(`Config: ${formatJson(config)}`);

/* Setup DB ******************************************************************/
/* Build the database schema file list */
const dbSchemas = []; 
fs.readdirSync('./models').forEach(file => {
	dbSchemas.push(path.join(__dirname, 'models', file));
})
require('./loaders/mongo-db').setup(config.database, dbSchemas);

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
require('./loaders/session')(app, config.session);

/* Setup Routes **************************************************************/
const staticRoutesPath = path.join(__dirname, 'routes');
require('./loaders/routes')(app, staticRoutesPath);

/** Create and launch the server *********************************************/
require('./loaders/server')(app, config);