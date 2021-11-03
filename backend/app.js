/* Grab all dependencies *****************************************************/
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
const helmet = require('helmet');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const mongoSantiize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

/* Setup dependencies ********************************************************/
const {logger , httpLogger, getOutputType} = require('./utils/logger')

logger.info(`Running server in a '${process.env.NODE_ENV}' environment`);

const requiredEnvVars = ['PORT', 'DB_TYPE', 'DB_IP', 'DB_PORT', 'DB_NAME',
	'SESSION_NAME', 'SESSION_SECRET', 'SESSION_TTL' ];

const usefulEnvVars = [ 'HTTPS_PORT', 'TLS_FILES_PATH', 'TLS_CERT_FILENAME',
	'TLS_KEY_FILENAME',	'DB_USERNAME', 'DB_PASSWORD'];

/** Verify required environment variables and exit if they're not defined */
requiredEnvVars.forEach((envName) => {
	if ((envName in process.env) === false || process.env[envName] === '') {
		logger.error(`${envName} is needed but not defined, exiting`);
		process.exit();
	}
})

/** Verify useful environment variables, but warn if they're not defined */
usefulEnvVars.forEach((envName) => {
	if ((envName in process.env) === false || process.env[envName] === '') {
		logger.warn(`${envName} is not defined, you may want to check ` + 
			`this is intended`);
	}
})

/* Setup DB ******************************************************************/
if (process.env.DB_TYPE === 'mongodb') {
	const schemaFiles = [
		'../components/blog/blog-schema',
		'../components/editor/editor-schema']
	const dbParams = {
		ipAddress: process.env.DB_IP,
		portNumber: process.env.DB_PORT, 
		dbName: process.env.DB_NAME, 
		username: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD
	}
	require('./dbs/mongo-db').initMongo(
		dbParams,
		schemaFiles);
}

/* Create Express Instance ***************************************************/
var app = express()

/* Setup secure packages *****************************************************/
app.use(helmet());
app.use(xssClean());
app.use(hpp());
app.use(mongoSantiize());

let limiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	max: 100
});

app.use(limiter);

/* Setup Sessioning **********************************************************/
let session;

if (process.env.SESSION_TYPE == "cookie") {
	logger.info(`Using cookie sessioning`);
	session = require('cookie-session')({
		name: process.env.SESSION_NAME,
		secret: process.env.SESSION_SECRET,
		maxAge: process.env.SESSION_TTL,
		secure: true
	});
	app.use(session);
}
else {
	logger.info(`Using Express sessioning`)
	session = require('express-session')({
		name: process.env.SESSION_NAME,
		secret: process.env.SESSION_SECRET,
		resave: false,
		cookie: { 
			maxAge: 1000 * 60 * 5,
			secure: true,
		},
		saveUninitialized: true
	})
	app.use(session)
}
app.use(session);
	
/* Setup Middleware **********************************************************/
app.set('views', path.join(__dirname, '../client/views'))
app.set('view engine', 'pug')
app.use(cookieParser())
app.use(morgan('short', {
	stream: httpLogger.stream
}))
app.use(express.json())
app.use(express.urlencoded({
	extended: false
}))
app.use(express.static(path.join(__dirname, '../client/public')))

/* Setup Routes **************************************************************/
const indexRoutes = require('./routes/index-routes');
const blogRoutes = require('./routes/blog-routes');
const editorRoutes = require('./routes/editor-routes');
app.use('/', indexRoutes);
app.use('/blog', blogRoutes);
app.use('/editor', editorRoutes)

/* Perform other initialziations *********************************************/

/* Launch the listeners ******************************************************/
// catch 404 and forward to error handler
app.use(function (req, res, next) {
	res.status(404);
	if(process.env.NODE_ENV === 'development') {
		next(createError(404));
	}
	else {
		next(res.render('404', {title: 'Page not found'}));
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
	res.render('error', {
		title: 'Website error',
		message: res.locals.message,
		error: res.locals.error
	})
})

module.exports = {
	app,
}