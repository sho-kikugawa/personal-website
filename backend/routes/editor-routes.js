
/**
 * @file Handles routes from the '/editors' root.
 */
const slowDown = require("express-slow-down");
const router = require('express').Router();
const createError = require('http-errors');

const config = require('../config/config')();
const { createBlog, getBlogData, generatePreview, updateBlog, deleteBlog } 
	= require('../service/blog');
const { editorLogin } = require('../service/editor');
const { logger, formatJson } = require('../utils/logger');
const { RenderData } = require('../utils/render-data');

const basepath = '/editor';
/**
 * A wrapper handle requests through the editors route that requires a login.
 * @param {*} controllerFunc - Function from a controller to handle the route
 * @param {*} req - Request data (from Express)
 * @param {*} res - Response data (from Express)
 * @param {*} next - Callback to the next function (from Express)
 */
function editorHandler(req, res, next) {
	if ('editor' in req.session) {
		next();
	}
	else {
		next(createError(404));
	}
}

function blogPublishHandler(req, res, next, create=false) {
	const body = req.body;
	let title = (create === true) ? 'Blog creation error' : 'Blog update error';

	if (!body.title || !body.summary || !body.content) {
		let pageData = new RenderData(title, req.session, res.locals);
		pageData.message = 'Title, summary, or content was left blank';
		res.render('editor/response', pageData);
	}
	else if (create === true) {
		createBlog(body.title, body.summary, body.content)
		.then(blogData => {
			if(blogData === null) {
				let pageData = new RenderData(title, req.session, res.locals);
				pageData.message = 'There was a problem creating the blog';
				res.render('editor/response', pageData);
			}
			else {
				res.redirect(`/blog/article/${blogData.internalTitle}`);
			}
		})
		.catch(err => {
			next(err);
		})
	}
	else {
		const basePath = '/editor/edit/';
		const originalUrl = req.originalUrl.substring(basePath.length);
		updateBlog(originalUrl, body.title, body.summary, body.content)
		.then(updateData => {
			if(updateData.updated === false) {
				let pageData = new RenderData(title, req.session, res.locals);
				pageData.message = 'There was a problem updating the blog';
				res.render('editor/response', pageData);
			}
			else {
				logger.debug(`Redirecting to ${formatJson(updateData)}`);
				res.redirect(`/blog/article/${updateData.newUrl}`);
			}
		})
		.catch(err => {
			next(err);
		})
	}
}
/* GET routers ***************************************************************/
router.get('/create', editorHandler, (req, res) => {
	let pageData = new RenderData('Create a blog', req.session, res.locals);
	pageData.blogData = {title: "", summary: "", content: ""};
	pageData.newArticle = true;
	res.render('editor/publish', pageData);
});

router.get('/edit/*', editorHandler, (req, res) => {
	const basePath = 'editor/edit/';
	let internalTitle = req.originalUrl.substring(basePath.length + 1);

	getBlogData(internalTitle)
	.then(blogData => {
		let pageData = new RenderData('', req.session, res.locals)
		let renderPath = 'editor/publish'
		if (blogData === null) {
			pageData.updateTitle('Blog Editor Error');
			pageData.message = `Could not find blog ${internalTitle}`;
			renderPath = 'editor/response'
		}
		else {
			pageData.updateTitle(`Editing ${blogData.title}`);
			pageData.blogData = blogData;
		}
		logger.debug(formatJson(pageData));
		res.render(renderPath, pageData);
	});
});

router.get('/login', (req, res) => {
	const pageData = new RenderData('Editor login', req.session, res.locals);
	res.render('editor/login', pageData);
})

/* POST routers **************************************************************/
/**
 * Sets up the rate limiter for certain routes.
 */
const loginSpeedLimiter = slowDown((() => {
	let limiter = {
		windowMs: config.rateLimiter.limitMs,
		delayAfter: config.rateLimiter.delayAfter,
		delayMs: config.rateLimiter.delayMs
	}
	logger.debug(`Speed limiter: ${formatJson(limiter)}`)
	return limiter;
})());

router.post('/login', loginSpeedLimiter, (req, res) => {
	if (!req.body.editorUsername || !req.body.editorPassword) {
		let pageData = new RenderData('Login error', req.session, res.locals);
		pageData.message = 'No username or password given';
		res.render('editor/response', pageData);
	}
	else {
		editorLogin(req.body.editorUsername, req.body.editorPassword)
		.then(editorData => {
			let pageData = new RenderData('', req.session, res.locals);
			if (editorData !== null) {
				logger.info(`Editor ${editorData.username} logged in.`);
				res.cookie(config.session.name, 'value', {
					editor: editorData.editorId
				});
				req.session.editor = editorData.editorId;
				req.session.save();
				pageData.updateTitle('Login success');
				pageData.message = 'You\'re logged in!';
			}
			else {
				pageData.updateTitle('Login error');
				pageData.message = 'Username or password is incorrect';
			}
			res.render('editor/response', pageData);
		}) 
	}
	
});

router.post('/logout', (req, res) => {
	req.session.destroy(err => {
		if(err) {
			logger.error(err);
		}
		res.redirect('/');
	});
});

router.post('/create', editorHandler, (req, res, next) => {
	blogPublishHandler(req, res, next, true);
});

router.post('/edit/*', editorHandler, (req, res, next) => {
	blogPublishHandler(req, res, next, false);
});

router.post('/preview', editorHandler, (req, res) => {
	const blogData = generatePreview(req.body.title,
		req.body.summary, req.body.content);
	logger.debug(`${formatJson(blogData)}`);
	let pageData = new RenderData(blogData.title, req.session, res.locals);
	pageData.data = blogData;
	logger.debug(`${formatJson(pageData)}`);
	res.render('blog/blog', pageData);
})

router.post('/delete/*', editorHandler, (req, res) => {
	const basePath = 'editor/delete/';
	const internalTitle = req.originalUrl.substring(basePath.length + 1);
	deleteBlog(internalTitle)
	.then(blogDeleted => {
		if (blogDeleted === true) {
			res.redirect('/blogs');
		}
		else {
			let pageData = new RenderData('Blog delete error', req.session, res.locals);
			pageData.message = 'Blog was not deleted';
			res.render('editor/response', pageData);
		}
	})
});

module.exports =  {
	basepath,
	router
};