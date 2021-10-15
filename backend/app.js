/** Get dotenv settings */
//require('dotenv-flow').config()

/* Grab all dependencies *****************************************************/
var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var morgan = require('morgan')

/* Setup dependencies ********************************************************/
const logger = require('./utils/logger').logger
const httpLogger = require('./utils/logger').httpLogger
logger.info(`Running server in a '${process.env.NODE_ENV}' environment`)

/* Setup DB ******************************************************************/
if (process.env.DB_TYPE === 'mongodb') {
	const schemaFiles = ['../components/blog/blog-schema']
	require('./dbs/mongo-db').initMongo(schemaFiles)
}

/* Create Express Instance ***************************************************/
var app = express()

/* Setup Sessioning **********************************************************/

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
console.log(`DIR NAME ${__dirname}`)
app.use(express.static(path.join(__dirname, '../client/public')))

/* Setup Routes **************************************************************/
const indexRoutes = require('./routes/index-routes');
const blogRoutes = require('./routes/blog-routes');
const editorRoutes = require('./routes/editor-routes');
app.use('/', indexRoutes);
app.use('/blog', blogRoutes);
app.use('/editor', editorRoutes)

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
		title: 'Website error'
	})
})

module.exports = {
	app,
}