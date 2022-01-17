const { logger, formatJson } = require('../utils/logger');

function load(app, sessionConfig, redisClient = null) {
	const expressSession = require('express-session');
	let sessionParams = {
		name: sessionConfig.name,
		secret: sessionConfig.secret,
		resave: false,
		cookie: { 
			maxAge: parseInt(sessionConfig.ttl),
			secure: false,
		},
		saveUninitialized: true
	};
	
	if (sessionConfig.type === 'db') {
		const cookieParser = require('cookie-parser');
		const connectRedis = require('connect-redis');
		const redisStore = connectRedis(expressSession);
		logger.info(`Using Redis sessioning`);
	
		app.use(expressSession({
			secret: sessionConfig.secret,
			store: new redisStore({ 
				host: sessionConfig.dbIp,
				port: sessionConfig.dbPort,
				client: redisClient,
				ttl :  300}),
			saveUninitialized: false,
			resave: false
		}));
		app.use(cookieParser(sessionConfig.cookieSecret));
	}
	else {
		logger.info(`Using Express sessioning`);
		app.use(expressSession(sessionParams));
	}
}

module.exports = load;