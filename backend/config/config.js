const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

function getConfig() {
	let config = {
		environment: 'production' || process.env.NODE_ENV,
		httpPort: 3000 || process.env.PORT,
		httpsPort: 3001 || process.env.HTTPS_PORT,
		database: {
			url: 'localhost' || process.env.DB_IP,
			port: 27017 || process.env.DB_PORT,
			name: 'test' || process.env.DB_NAME,
			username: '' || process.env.DB_USERNAME,
			password: '' || process.env.DB_PASSWORD
		},
		certs: {
			path: '' || process.env.TLS_FILES_PATH,
			certFile: '' || process.env.TLS_CERT_FILENAME,
			keyFile: '' || process.env.TLS_KEY_FILENAME

		},
		session: {
			type: 'default' || process.env.SESSION_TYPE,
			name: 'CHANGEME' || process.env.SESSION_NAME,
			secret: 'CHANGEME' || process.env.SESSION_SECRET,
			cookieSecret: 'CHANGEME' || process.env.SESSION_COOKIE_SECRET,
			ttl: (365 * 24 * 60 * 1000) || process.env.SESSION_TTL,
	
			dbIp: 'localhost' || process.env.SESSION_DB_IP,
			dbPort: 6379 || process.env.SESSION_DB_PORT,
			dbUsername: '' || process.env.SESSION_DB_USERNAME,
			dbPassword: '' || process.env.SESSION_DB_PASSWORD,
		},
		rateLimiter: {
			limitMs: (10 * 60 * 1000) || process.env.RATE_LIMIT_MS,
			maxReq: 100 || process.env.RATE_MAX_REQS,
			timeoutMs: (15 * 60 * 1000) || process.env.POST_WINDOW_TIMEOUT,
			delayAfter: 5 || process.env.POST_DELAY_AFTER,
			delayMs: 250 || process.env.POST_DELAY_MS,
		},
	}
	return config;
}

module.exports = getConfig;