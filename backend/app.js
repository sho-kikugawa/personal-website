/**
 * @file Main app configuration.
 */
const path = require('path'); 
require('dotenv').config({ path: path.join(__dirname, './config/.env') });

const { logger , httpLogger, formatJson } = require('./utils/logger');
const { checkRequiredEnv, checkUsefulEnv, isEnvDefined } = 
	require ('./config/config');
const { requiredEnvs, productionEnvs, dbSchemas } = 
	require ('./config/config');

/* Setup environment ********************************************************/
/* Force production environment if NODE_ENV isn't 'development'*/
if (process.env.NODE_ENV !== 'development') {
	process.env.NODE_ENV = `production`
}
logger.info(`Running server in a [${process.env.NODE_ENV}] environment`);

/** Verify required environment variables and exit if they're not defined */
requiredEnvs.forEach(checkRequiredEnv);

if (process.env.NODE_ENV === `production`) {
	productionEnvs.forEach(checkRequiredEnv);
}
else if(process.env.NODE_ENV === `development`) {
	productionEnvs.forEach(checkUsefulEnv);
}

/* Setup DB ******************************************************************/
const dbParams = {
	ipAddress: process.env.DB_IP,
	portNumber: process.env.DB_PORT, 
	dbName: process.env.DB_NAME, 
	username: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD
}
require('./dbs/mongo-db').initMongo(dbParams, dbSchemas);

/* Create Express Instance ***************************************************/
const express = require('express');
var app = express()

/* Setup security/reliability packages ***************************************/
const helmet = require('helmet');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const mongoSantiize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const { generateKey } = require('./utils/crypto')

app.use(function(req, res, next) {
	res.locals.styleNonce = generateKey();
	res.locals.scriptNonce = generateKey();
	next()
});

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
	useDefaults: true,
	directives: {
		scriptSrc: [ 
			"'strict-dynamic'", 
			function(req, res){ return `'nonce-${res.locals.scriptNonce}'`}, 
			"'unsafe-inline'", 
			'http:', 
			'https:'
		],
		styleSrc: [
			"'self'", 
			function(req, res){ return `'nonce-${res.locals.styleNonce}'`}, 
			"'unsafe-inline'", 
			'http:', 
			'https:'
		]
	}
}));
app.use(xssClean());
app.use(hpp());
app.use(mongoSantiize());

if(process.env.NODE_ENV === `production`) {
	let limitMs = 10 * 60 * 1000; // 10 minutes
	let maxReq = 100;

	if (isEnvDefined('RATE_LIMIT_MS') === true) {
		const envVal = parseInt(process.env.RATE_LIMIT_MS);
		limitMs = (isNaN(envVal)) ? limitMs : envVal;
	}
	if (isEnvDefined('RATE_MAX_REQS') === true) {
		const envVal = parseInt(process.env.RATE_MAX_REQS);
		maxReq = (isNaN(envVal)) ? maxReq : envVal;
	}

	const  limiter = rateLimit({
		windowMs: limitMs,
		max: maxReq
	});

	logger.debug(`Rate limit time: ${limitMs}ms`);
	logger.debug(`Request limit: ${maxReq}`);
	app.use(limiter);
}

	
/* Setup Middleware **********************************************************/
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

app.set('views', path.join(__dirname, '../client/views'))
app.set('view engine', 'pug')
app.use(morgan('short', {stream: httpLogger.stream}))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname, '../client/public')))

/* Setup Sessioning **********************************************************/
let expiryTime = parseInt(process.env.SESSION_TTL, 10);
if (isNaN(expiryTime) === true) {
	expiryTime = 5 * 60 * 1000;
}

let sessionParams = {
	name: process.env.SESSION_NAME,
	secret: process.env.SESSION_SECRET,
	resave: false,
	cookie: { 
		maxAge: expiryTime,
		secure: true,
	},
	saveUninitialized: true
};

if (isEnvDefined('SESSION_TYPE') === true && process.env.SESSION_TYPE === 'db') {
	const redis = require('redis');
	const expressSession = require('express-session');
	const connectRedis = require('connect-redis');
	const redisStore = connectRedis(expressSession);
	const redisClient = redis.createClient();
	logger.info(`Using Redis sessioning`);

	redisClient.auth(process.env.SESSION_DB_PASSWORD);
	app.use(expressSession({
		secret: process.env.SESSION_SECRET,
		store: new redisStore({ 
			host: process.env.SESSION_DB_IP, 
			port: process.env.SESSION_DB_PORT, 
			client: redisClient,
			ttl :  300}),
		saveUninitialized: false,
		resave: false
	}));
	app.use(cookieParser(process.env.SESSION_COOKIE_SECRET));

	redisClient.on('error', (err) => {
		logger.error(`Reddis error: ${formatJson(err)}`);
	});
	redisClient.on('connect', (err) => {
		logger.info(`Connected to Redis`);
	});
}
else {
	logger.info(`Using Express sessioning`);
	const session = require('express-session')(sessionParams);
	app.use(session);
}

/* Setup Routes **************************************************************/
const indexRoutes = require('./routes/index-routes');
const blogRoutes = require('./routes/blog-routes');
const blogsRoutes = require('./routes/blogs-routes');
const editorRoutes = require('./routes/editor-routes');
app.use('/', indexRoutes);
app.use('/blog', blogRoutes);
app.use('/blogs', blogsRoutes);
app.use('/editor', editorRoutes)

/* Perform other initialziations *********************************************/

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

module.exports = {
	app,
}