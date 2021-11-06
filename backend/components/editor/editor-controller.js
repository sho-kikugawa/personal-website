const sanitizer = require('sanitize-html');
const blogService = require('../blog/blog-service');
const editorService = require('./editor-service');
const { logger, formatJson } = require("../../utils/logger");
const { RenderData } = require('../../routes/router-utils');

const TITLE_REGEX = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;

async function getCreateBlog(req, res) {
	let data = new RenderData('Create a blog', req);
	data.data = {title: "", subtitle: "", content: "" };
	data.newArticle = true;
	res.render('editor/publish', data);
}

async function getEditBlog(req, res) {
	const basePath = "/editor/edit/";
	let internalTitle = req.originalUrl.substring(basePath.length);

	if (await blogService.getIfBlogExists(internalTitle) === false)  {
		let data = new RenderData('Edit blog error', req);
		data.message = `This blog does not exist :<`;
		res.render('editor/response', data);
	}
	else {
		let blogData = await blogService.getBlog(internalTitle);
		let data = new RenderData(`Editing: ${blogData.title}`, req);
		data.blogData = blogData;
		res.render('editor/publish', data);
	}
}

async function postCreateBlog(req, res) {
	const urlTitle = req.body.title.replace(TITLE_REGEX, '').replaceAll(' ', '-').toLowerCase();
	logger.debug(`Creating a blog: ${formatJson(req.body)}`);

	if (await blogService.getIfBlogExists(urlTitle) === true) {
		let data = new RenderData('Create blog error', req);
		data.message = `A blog with this title already exists :<`;
		res.render('editor/response', data);
	}
	else {
		let blogData = await blogService.createBlog(
			urlTitle, 
			sanitizer(req.body.title),
			sanitizer(req.body.subtitle),
			
			// This will get sanitized on display
			req.body.content);
		logger.debug(`blogData if created: ${formatJson(blogData)}`);
		res.redirect(`/blog/article/${urlTitle}`);
	}
}

async function postEditorLogin(req, res) {
	if (!req.body.editorUsername || !req.body.editorPassword) {
		let data = new RenderData('Login error', req);
		data.message = `No username or password given`;
		res.render('editor/response', data);
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
			res.render('editor/response', data);
		}
		else {
			let data = new RenderData('Login error', req);
			data.message = `Username or passsword is incorrect`;
			res.render('editor/response', data);
		}
	}
}

async function postEditorLogout (req, res) {
	req.session.destroy((err) => {
        if(err){
            logger.error(err);
        } 
		res.redirect('/');
    });
}

async function postEditBlog(req, res) {
	const urlTitle = req.body.title.replace(TITLE_REGEX, '').replaceAll(' ', '-').toLowerCase();
	logger.debug(`Editing a blog: ${formatJson(req.body)}`);

	if (await blogService.getIfBlogExists(urlTitle) === false) {
		let data = new RenderData('Edit blog error', req);
		data.message = `This blog does not exist :<`;
		res.render('editor/response', data);
	}
	else {
		const updatedBlog = {
			internalTitle: urlTitle,
			title: req.body.title,
			subtitle: req.body.subtitle,
			content: req.body.content
		}
		const updateResult = await blogService.updateBlog(urlTitle, updatedBlog);
		logger.debug(`Update result: ${formatJson(updateResult)}`);

		if (updateResult.modifiedCount === 1) {
			res.redirect(`/blog/article/${urlTitle}`);
		}
		else {
			let data = new RenderData('Editing blog error', req)
			data.message = `Blog was not updated: ${formatJson(updateResult)}`;
			res.render('editor/response', data);
		}
	}
}

async function postDeleteBlog (req, res) {
	const basePath = "/editor/delete/";
	let urlTitle = req.originalUrl.substring(basePath.length);

	logger.debug(`Deleting a blog: ${formatJson(urlTitle)}`);
	if (await blogService.getIfBlogExists(urlTitle) === false) {
		let data = new RenderData('Deleting blog error', req);
		data.message = `This blog does not exist :<`;
		res.render('editor/response', data);
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
			res.render('editor/response', data);
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
	postDeleteBlog
};