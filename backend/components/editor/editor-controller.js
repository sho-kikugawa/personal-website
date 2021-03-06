/**
 * @file Controller for handling all routes pertaining to editor functions,
 * 		including logging in and creating, editing, and deleting blogs.
 */
const marked = require('marked');
const sanitizer = require('sanitize-html');
const blogService = require('../blog/blog-service');
const editorService = require('./editor-service');
const { logger, formatJson } = require("../../utils/logger");
const { RenderData, renderPage } = require('../../routes/router-utils');

/*	Filters out everything except letters, numbers, punctuation, and 
	non-visible characters.
*/
const FILTER_REGEX = /[^\p{L}\p{N}\p{P}\p{Z}]/gu;

/**
 * Renders the page to create a new blog.
 * @param {Object} req - Request object (from Express)
 * @param {Object} res - Response object (from Express)
 */
async function getCreateBlog(req, res) {
	let data = new RenderData('Create a blog', req);
	data.blogData = {title: "", summary: "", content: "" };
	data.newArticle = true;
	renderPage('editor/publish', data, res);
}

/**
 * Gets a blog to edit. If the blog exists, renders the publish page with the
 * data filled out. Otherwise show that the blog does not exist.
 * @param {Object} req - Request object (from Express). Uses the body object
 * 		to get the blog title, summary, and contents.
 * @param {Object} res - Response object (from Express)
 */
async function getEditBlog(req, res) {
	const basePath = "/editor/edit/";
	let internalTitle = req.originalUrl.substring(basePath.length);

	if (await blogService.getIfBlogExists(internalTitle) === false)  {
		let data = new RenderData('Edit blog error', req);
		data.message = `This blog does not exist :<`;
		renderPage('editor/response', data, res);
	}
	else {
		let blogData = await blogService.getBlog(internalTitle);
		let data = new RenderData(`Editing: ${blogData.title}`, req);
		data.blogData = blogData;
		renderPage('editor/publish', data, res);
	}
}

/**
 * Handles a post request to create a new blog. If the blog exists, it will 
 * render a page saying such. Otherwise it redirects the user to the blog
 * page.
 * @param {Object} req - Request object (from Express) Uses the body object
 * 		to get the blog title, summary, and contents.
 * @param {Object} res - Response object (from Express)
 */
async function postCreateBlog(req, res) {
	// Capping title and summary to 255 characters
	req.body.summary = req.body.summary.substring(0, 255);
	req.body.title = req.body.title.substring(0, 255);
	const urlTitle = req.body.title.replace(FILTER_REGEX, '')
		.trim()
		.replaceAll(' ', '-')
		.toLowerCase();
	logger.debug(`Creating a blog: ${formatJson(req.body)}`);

	if (await blogService.getIfBlogExists(urlTitle) === true) {
		let data = new RenderData('Create blog error', req);
		data.message = `A blog with this title already exists :<`;
		renderPage('editor/response', data, res);
	}
	else {
		let blogData = await blogService.createBlog(
			urlTitle, 
			sanitizer(req.body.title),
			sanitizer(req.body.summary),
			
			// This will get sanitized on display
			req.body.content);
		logger.debug(`blogData if created: ${formatJson(blogData)}`);
		res.redirect(`/blog/article/${urlTitle}`);
	}
}

/**
 * Handles a post request to login.
 * @param {Object} req - Request object (from Express). Uses the body object to
 * 		get the username and password.
 * @param {Object} res - Response object (from Express)
 */
async function postEditorLogin(req, res) {
	if (!req.body.editorUsername || !req.body.editorPassword) {
		let data = new RenderData('Login error', req);
		data.message = `No username or password given`;
		renderPage('editor/response', data, res);
	}
	else {
		let editorData = await editorService.editorLogin(
			req.body.editorUsername, 
			req.body.editorPassword);
		if (editorData !== null)
		{
			logger.info(`Editor ${editorData.username} logged in`);
			logger.debug(`Editor data from login: ${formatJson(editorData)}`);
			res.cookie(process.env.SESSION_NAME, 'value', {
				editor: editorData.editorId
			})
			req.session.editor = editorData.editorId;
			req.session.save();

			logger.debug(`Session: ${formatJson(req.session)}`);
			let data = new RenderData('Login success', req);
			data.message = `You're logged in!`;
			renderPage('editor/response', data, res);
		}
		else {
			let data = new RenderData('Login error', req);
			data.message = `Username or passsword is incorrect`;
			renderPage('editor/response', data, res);
		}
	}
}

/**
 * Handles a post request to logout.
 * @param {Object} req - Request object (from Express)
 * @param {Object} res - Response object (from Express)
 */
async function postEditorLogout (req, res) {
	req.session.destroy((err) => {
        if(err){
            logger.error(err);
        } 
		res.redirect('/');
    });
}

/**
 * Handles a request to edit a blog. If the blog does not exist or there was a 
 * problem, it renders a page saying such. If the blog was updated, it 
 * redirects to the article page.
 * @param {Object} req - Request object (from Express) Uses the body object
 * 		to get the blog title, summary, and contents.
 * @param {Object} res - Response object (from Express)
 */
async function postEditBlog(req, res) {
	const basePath = "/editor/edit/";
	const originalUrlTitle = req.originalUrl.substring(basePath.length);
	const urlTitle = req.body.title.replace(FILTER_REGEX, '')
		.trim()
		.replaceAll(' ', '-')
		.toLowerCase();
	logger.debug(`Editing a blog from ${originalUrlTitle}: ${formatJson(req.body)}`);

	if (await blogService.getIfBlogExists(originalUrlTitle) === false) {
		let data = new RenderData('Edit blog error', req);
		data.message = `This blog does not exist :<`;
		renderPage('editor/response', data, res);
	}
	else {
		// Capping title and summary to 255 characters
		req.body.summary = req.body.summary.substring(0, 255);
		req.body.title = req.body.title.substring(0, 255);
		const updatedBlog = {
			internalTitle: urlTitle,
			title: sanitizer(req.body.title),
			summary: sanitizer(req.body.summary),
			content: req.body.content
		}
		const updateResult = await blogService.updateBlog(originalUrlTitle, updatedBlog);
		logger.debug(`Update result: ${formatJson(updateResult)}`);

		if (updateResult.modifiedCount === 1) {
			res.redirect(`/blog/article/${urlTitle}`);
		}
		else {
			let data = new RenderData('Editing blog error', req)
			data.message = `Blog was not updated: ${formatJson(updateResult)}`;
			renderPage('editor/response', data, res);
		}
	}
}

async function postPreviewBlog(req, res) {
	let date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	date = date.substring(0, 10);
	blogData = {
		title: `PREVIEW: ${sanitizer(req.body.title)}`,
		summary: sanitizer(req.body.summary),
		content: marked(req.body.content),
		dateString: date
	}
	blogData.content = sanitizer(blogData.content, {
		allowedTags: sanitizer.defaults.allowedTags.concat([ 'img' ])
	});

	let data = new RenderData(blogData.title, req);
	data.data = blogData
	renderPage('blog/blog', data, res);
}

/**
 * Handles a post request to delete the blog.
 * @param {Object} req - Request object (from Express) Uses the body object
 * 		to get the blog title.
 * @param {Object} res - Response object (from Express)
 */
async function postDeleteBlog (req, res) {
	const basePath = "/editor/delete/";
	let urlTitle = req.originalUrl.substring(basePath.length);

	logger.debug(`Deleting a blog: ${formatJson(urlTitle)}`);
	if (await blogService.getIfBlogExists(urlTitle) === false) {
		let data = new RenderData('Deleting blog error', req);
		data.message = `This blog does not exist :<`;
		renderPage('editor/response', data, res);
	}
	else {
		const deleteResult = await blogService.deleteBlog(urlTitle);
		logger.debug(`Deletion result: ${formatJson(deleteResult)}`);

		if(deleteResult.deletedCount === 1) {
			res.redirect('/blogs')
		}
		else {
			let data = new RenderData('Deleting blog error', req);
			data.message = `The blog wasn't deleted: ${formatJson(deleteResult)}`;
			renderPage('editor/response', data, res);
		}
	}
}

module.exports = {
	getCreateBlog,
	getEditBlog,
	postEditorLogin,
	postEditorLogout,
	postCreateBlog,
	postEditBlog,
	postPreviewBlog,
	postDeleteBlog
};