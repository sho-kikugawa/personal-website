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
require('./config/mongo-db').initMongo(config.database, dbSchemas);

/* Create Express Instance ***************************************************/
const express = require('express');
let app = express();

/* Load and setup security packages ******************************************/
require('./loaders/security-loader')(app, config);

/* Load and setup server middleware ******************************************/
const clientPaths = { 
	views: path.join(__dirname, '../client/views'),
	public: path.join(__dirname, '../client/public')
};
require('./loaders/server-loader')(app, clientPaths);

/* Load and setup sessioning *************************************************/
require('./loaders/session-loader')(app, config.session);

/* Load and setup sessioning *************************************************/
require('./loaders/session-loader')(app, config.session);

/* Setup Routes **************************************************************/
const staticRoutesPath = path.join(__dirname, 'routes');
require('./loaders/routes-loader')(app, staticRoutesPath);

/* Launch the listeners ******************************************************/
const createError = require('http-errors');
const { RenderData } = require('./routes/router-utils');
// catch 404 and forward to error handler
app.use(function (req, res, next) {
	res.status(404);
	if(process.env.NODE_ENV === 'development') {
		next(createError(404));
	}
	else {
		const data = new RenderData('Page not found', req)
		next(res.render('404', data));
	}
})

// error handler
app.use(function (err, req, res, next) {
	//logger.error(`The server ran into a problem: ${err.stack || err}`)
	// Show error on web page if in a development environment.
	if (req.app.get('env') === 'development') {
		res.locals.message =  err.message 
		res.locals.error = err
	}
	else {
		res.locals.message = "The server encountered a problem 🙁"
		res.locals.error = {}
	}

	// render the error page
	res.status(err.status || 500)
	let data = new RenderData('Website error', req);
	data.message = res.locals.message;
	data.error = res.locals.error;
	res.render('error', data);
})

/* Create and start server ***************************************************/
const http = require('http');
const server = http.createServer(app);
logger.info('Starting server at port ' + config.httpPort);
server.listen(config.httpPort, () => {
	logger.info('server started.')
	onListening(server);
});

try {
	const certFilename = path.join(__dirname, config.certs.path, config.certs.certFile);
	const keyFilename = path.join(__dirname, config.certs.path, config.certs.keyFile);

	if (fs.existsSync(keyFilename) && fs.existsSync(certFilename)) {
		let options = { 
			key: fs.readFileSync(keyFilename),
			cert: fs.readFileSync(certFilename)
		};
		let server = https.createServer(options, app);
		logger.info('Starting https server at port ' + config.httpsPort);
		logger.info('Starting http server at port ' + config.port);
		server.listen(config.httpsPort, () => {
			logger.info('server started.');
			onListening(server);
		});
		server.on('error', (error) => {onError(error, config.httpsPort)});

		// Create HTTP server to redirect requests to HTTPS
		http.createServer((req, res) => {
			const portIdx = req.headers.host.indexOf(':');
			let hostname = req.headers.host;
			if( portIdx > -1) {
				hostname = req.headers.host.substring(0, portIdx);
			}
			res.writeHead(301, {
				location:`https://${hostname}:${config.httpsPort}${req.url}`
			})
			res.end();
		}).listen(config.port);
	}
	// HTTP only fallback
	else {
		logger.warn(`THIS SERVER IS BEING RUN IN HTTP ONLY MODE`);
		let server = http.createServer(app);
		logger.info('Starting http server at port ' + config.port)
		server.listen(config.port, () => {
			logger.info('server started.')
			onListening(server);
		});
		server.on('error', (error) => {onError(error, config.port)});
	}
}
catch (err) {
	logger.error(err);
}

function onError(error, port) {
	if (error.syscall !== 'listen') { throw error; }

	let bind = typeof port === 'string'	? 'Pipe ' + port : 'Port ' + port;

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			console.error(bind + ' requires elevated privileges');
			process.exit(1);
		case 'EADDRINUSE':
			console.error(bind + ' is already in use');
			process.exit(1);
		default:
			throw error;
	}
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening(server) {
	let addr = server.address();
	let bind = typeof addr === 'string'
		? 'pipe ' + addr
		: 'port ' + addr.port;
	logger.debug('Listening on ' + bind);
}
