const logger = require('../../utils/logger').logger;
const formatJson = require('../../utils/logger').formatJson;
const blogService = require('../blog/blog-service');
const editorService = require('./editor-service');

const TITLE_REGEX = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;

let accessList = [];

function setupAccessList(path) {
	const fs = require('fs');
	fs.readFile(path, 'utf8', function (err,data) {
		if (err) {
		  return logger.error(err);
		}
		accessList = data.split('\n');
		logger.debug(`Account access list: ${accessList}`);
	});
}

async function getEditBlog(req, res) {
	if (!req.query || ('title' in req.query) === false) {
		res.render('editor/editing-result', {result: "No blog title to edit"});
	}
	else if (await blogService.getIfBlogExists(req.query.title) === false ){
		res.render('editor/editing-result', {result: "No blog with that name exists"});
	}
	else {
		let blogData = await blogService.getBlog(req.query.title);
		res.render('editor/edit-blog', 
			{title: `Editing: ${blogData.title}`, data: blogData
		});
	}
}

async function postCreateBlog(req, res) {
	const urlTitle = req.body.blogTitle.replace(TITLE_REGEX, '').replaceAll(' ', '-').toLowerCase();
	logger.debug(`Creating a blog: ${formatJson(req.body)}`);

	if (await blogService.getIfBlogExists(urlTitle) === true) {
		res.render('editor/editing-result', {result: "This blog exists :<"})
	}
	else {
		let blogData = await blogService.createBlog(
			urlTitle, 
			req.body.blogTitle,
			req.body.blogSubtitle,
			req.body.blogContent);
		logger.debug(`blogData if created: ${formatJson(blogData)}`);
		res.render('editor/editing-result', {result: `Blog posted!`});
	}
}

async function postEditorLogin(req, res) {
	if (!req.body.editorUsername || !req.body.editorPassword) {
		res.render('editor/response', {
			title: `Editor Login`, 
			message: `No username or password given`
		});
	}
	else {
		let editorData = await editorService.editorLogin(
			req.body.editorUsername, 
			req.body.editorPassword);
		if (editorData !== null && 
			accessList.findIndex(element => element == editorData.editorId) > -1) 
		{
			logger.info(`Editor ${editorData.username} logged in`);
			logger.debug(`Editor data from login: ${formatJson(editorData)}`);
			if (req.session) {
				req.session = null;
				req.session = {};
			}
			res.cookie(process.env.COOKIE_NAME, 'value', {
				account: editorData.editorId
			});
			req.session.account = editorData.editorId;
			req.session.save();
			logger.debug(`Creating session for ${editorData.editorId}`);
			logger.debug(`Session: ${formatJson(req.session)}`);
			res.render('editor/response', {
				title: `Editor Login`, 
				message: `Login successful!`
			});
		}
		else {
			res.render('editor/response', {
				title: `Editor Login`, 
				message: `Invalid login`
			});
		}
	}
}

async function postEditorLogout (req, res) {
	req.session = null;
	res.redirect('/');
}

async function postEditBlog(req, res) {
	const urlTitle = req.body.title.replace(TITLE_REGEX, '').replaceAll(' ', '-').toLowerCase();
	logger.debug(`Editing a blog: ${formatJson(req.body)}`);

	if (urlTitle !== req.query.title && await blogService.getIfBlogExists(urlTitle) === true) {
		res.render('editor/editing-result', {
			title: "Edit failed",
			result: "This blog exists :<"
		});
	}
	else {
		let updatedBlog = {
			internalTitle: urlTitle,
			title: req.body.title,
			subtitle: req.body.subtitle,
			content: req.body.content
		}
		let updateResult = await blogService.updateBlog(req.query.title, updatedBlog);
		logger.debug(`Update result: ${formatJson(updateResult)}`);
		res.render('editor/editing-result', 
			{
				title: "Editing blog result",
				result: formatJson(updateResult)
			});
	}
}

async function postDeleteBlog (req, res) {
	if (("title" in req.query) && await blogService.getIfBlogExists(req.query.title) === false) {
		res.render('editor/editing-result', {
			title: "Delete failed",
			result: "This blog does not exist :<"
		});
	}
	else {
		logger.debug(`Deleting a blog: ${formatJson(req.query.title)}`);
		let deteleResult = await blogService.deleteBlog(req.query.title);
		logger.debug(`Deletion result: ${formatJson(deteleResult)}`);
		res.render('editor/editing-result', 
			{
				title: "Deleting blog result",
				result: `Result: ${formatJson(deteleResult)}`
			});
	}
}

module.exports = {
	setupAccessList,
	getEditBlog,
	postEditorLogin,
	postEditorLogout,
	postCreateBlog,
	postEditBlog,
	postDeleteBlog
};