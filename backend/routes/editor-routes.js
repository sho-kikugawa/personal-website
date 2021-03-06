
/**
 * @file Handles routes from the '/editors' root.
 */
const slowDown = require("express-slow-down");
const router = require('express').Router();
const createError = require('http-errors');
const {	getCreateBlog, getEditBlog, 
		postEditorLogin, postEditorLogout,
		postCreateBlog,
		postEditBlog, postPreviewBlog, postDeleteBlog} 
		= require('../components/editor/editor-controller');
const { handler }= require('./router-utils');
const { isEnvDefined } = require ('../config/config');
const { logger, formatJson } = require("../utils/logger");
const { RenderData, renderPage } = require('./router-utils');

/**
 * A wrapper handle requests through the editors route that requires a login.
 * @param {*} controllerFunc - Function from a controller to handle the route
 * @param {*} req - Request data (from Express)
 * @param {*} res - Response data (from Express)
 * @param {*} next - Callback to the next function (from Express)
 */
function editorHandler(controllerFunc, req, res, next) {
	if ('editor' in req.session) {
		handler(controllerFunc, req, res, next);
	}
	else {
		next(createError(404));
	}
}

/* GET routers ***************************************************************/
router.get('/create', (req, res, next) => {
	editorHandler(getCreateBlog, req, res, next);
});

// Pages in the list are accessed with /blogs/page/#
router.get('/edit/*', (req, res, next) => {
	editorHandler(getEditBlog, req, res, next);
});

router.get('/login', (req, res) => {
	const data = new RenderData('Editor login', req);
	renderPage('editor/login', data, res);
})

/* POST routers **************************************************************/
/**
 * Sets up the rate limiter for certain routes.
 */
const loginSpeedLimiter = slowDown((() => {
	let limiter = {
		windowMs: 15 * 60 * 1000, // 15 minutes
		delayAfter: 5,
		delayMs: 250
	}
	if(isEnvDefined('POST_WINDOW_TIMEOUT') === true) {
		const envVal = parseInt(process.env.RATE_LIMIT_MS);
		limiter.windowMs = (isNaN(envVal)) ? limiter.windowMs : envVal;
	}
	if(isEnvDefined('POST_DELAY_AFTER') === true) {
		const envVal = parseInt(process.env.POST_DELAY_AFTER);
		limiter.delayAfter = (isNaN(envVal)) ? limiter.delayAfter : envVal;
	}
	if(isEnvDefined('POST_DELAY') === true) {
		const envVal = parseInt(process.env.POST_DELAY);
		limiter.delayMs = (isNaN(envVal)) ? limiter.delayMs : envVal;
	}

	logger.debug(`Speed limiter: ${formatJson(limiter)}`)
	return limiter;
})());

router.post('/login', loginSpeedLimiter, (req, res, next) => {
	handler(postEditorLogin, req, res, next);
});

router.post('/logout', (req, res, next) => {
	editorHandler(postEditorLogout, req, res, next);
});

router.post('/create', (req, res, next) => {
	editorHandler(postCreateBlog, req, res, next);
});

router.post('/edit/*', (req, res, next) => {
	editorHandler(postEditBlog, req, res, next);
});

router.post('/preview', (req, res, next) => {
	editorHandler(postPreviewBlog, req, res, next);
})

router.post('/delete/*', (req, res, next) => {
	editorHandler(postDeleteBlog, req, res, next);
});

module.exports = router;