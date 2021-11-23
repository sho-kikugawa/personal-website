const {logger} = require('../utils/logger');
/* App specific configuration that doesn't make sense to use in an .env file */

/* Absolutely required environment variables */
const requiredEnvs = [
	'PORT',  
	'DB_IP', 
	'DB_PORT', 
	'DB_NAME',

	'SESSION_NAME', 
	'SESSION_SECRET', 
];

/* Environment variables required in production */
const productionEnvs = [
	'HTTPS_PORT',
	'LOG_OUTPUT',
	'DB_USERNAME', 
	'DB_PASSWORD',
	'SESSION_TTL',
	'SESSION_DB_IP',
	'SESSION_DB_PORT'
]

/* Environment variables meant only for development/debug */
const debugEnvs = [

];

/* Environment variables that don't need to be set 
	For the SSL/TLS cert variables, recommend using a web server to act as a 
	reverse proxy first. However, the server can still be configured to use
	SSL/TLS certs directly. 
*/
const optionalEnvs = [
	'LOG_PATH',
	'RATE_LIMIT_MS',
	'RATE_MAX_REQS',
	'TLS_FILES_PATH',
	'TLS_CERT_FILENAME',
	'TLS_KEY_FILENAME',
];

/* List of DB schema files */
const dbSchemas = [
	'../components/blog/blog-schema',
	'../components/editor/editor-schema'
];

function checkRequiredEnv(envName) {
	if (isEnvDefined(envName) === false) {
		logger.error(`Environment variable ${envName} is needed but not defined, exiting`);
		process.exit();
	}
}

function checkUsefulEnv (envName) {
	if (isEnvDefined(envName) === false) {
		logger.warn(`Environment variable ${envName} is not defined, consider defining it`);
	}
}

function isEnvDefined(envName) {
	return ((envName in process.env) === true && process.env[envName] !== '');
}

module.exports = {
	requiredEnvs,
	productionEnvs,
	debugEnvs,
	optionalEnvs,
	dbSchemas,

	checkRequiredEnv,
	checkUsefulEnv,
	isEnvDefined
}