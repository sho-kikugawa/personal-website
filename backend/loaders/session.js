const { logger, formatJson } = require('../utils/logger');

function load(app, sessionConfig) {
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
		const expressSession = require('express-session');
		const redis = require('redis');
		const redisClient = redis.createClient();
		const connectRedis = require('connect-redis');
		const redisStore = connectRedis(expressSession);
		logger.info(`Using Redis sessioning`);
	
		redisClient.auth(sessionConfig.dbPassword);
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
}

module.exports = load;