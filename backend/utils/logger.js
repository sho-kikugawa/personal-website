/**
 * Creates a new logger instance using Winston.
 */

const { createLogger, format, transports } = require('winston')
const { combine, timestamp, colorize, splat, printf } = format


/**
 * Get the environment this module is running under.
 **/
function getEnvironment() {
	if (process.env.NODE_ENV === 'development') {
		return 'debug'
	} else if (process.env.NODE_ENV === 'verbose') {
		return 'verbose'
	} else {
		return 'info'
	}
}

function getOutputType(logName) {
	if (process.env.LOG_OUTPUT === 'logfile') {
		return [
			new transports.File({
				filename: `${logName}-combined.log`,
				level: 'info',
				timestamp: true
			}),
			new transports.File({
				filename: `${logName}-errors.log`,
				level: 'error',
				timestamp: true
		})]
	}
	else {
		return [new transports.Console()]
	}
}

let logger = createLogger({
	level: getEnvironment(),
	format: combine(
		colorize(),
		timestamp({
			format: 'YYYY-MM-DD HH:mm:ss'
		}),
		splat(),
		printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
	),
	transports: getOutputType('server')
})

let httpLogger = createLogger({
	level: getEnvironment(),
	format: combine(
		timestamp({
			format: 'YYYY-MM-DD HH:mm:ss'
		}),
		splat(),
		printf(info => `${info.timestamp}: ${info.message}`)
	),
	transports: getOutputType('http')
})

httpLogger.stream = {
	write: (message) => {
		httpLogger.info(message)
	}
}

exports.logger = logger
exports.httpLogger = httpLogger
