const sanitizer = require('sanitize-html');
const { logger, formatJson } = require("../../utils/logger");
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
			sanitizer(req.body.blogTitle),
			sanitizer(req.body.blogSubtitle),
			
			// This will get sanitized on display
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
		if (editorData !== null)
		{
			logger.info(`Editor ${editorData.username} logged in`);
			logger.debug(`Editor data from login: ${formatJson(editorData)}`);
			res.cookie(process.env.SESSION_NAME, 'value', {
				account: editorData.editorId
			});
			req.session.sessionID = editorData.editorId;
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
		const updatedBlog = {
			internalTitle: urlTitle,
			title: req.body.title,
			subtitle: req.body.subtitle,
			content: req.body.content
		}
		const updateResult = await blogService.updateBlog(req.query.title, updatedBlog);
		let resultText;
		logger.debug(`Update result: ${formatJson(updateResult)}`);

		if (updateResult.modifiedCount === 1) {
			resultText = "Blog successfully updated!";
		}
		else {
			resultText = `Blog was not updated: ${formatJson(updateResult)}`;
		}
		res.render('editor/editing-result', 
			{
				title: "Editing blog result",
				result: resultText
			});
	}
}

async function postDeleteBlog (req, res) {
	logger.debug(`Deleting a blog: ${formatJson(req.query.title)}`);
	if (("title" in req.query) && await blogService.getIfBlogExists(req.query.title) === false) {
		res.render('editor/editing-result', {
			title: "Delete failed",
			result: "This blog does not exist :<"
		});
	}
	else {
		const deleteResult = await blogService.deleteBlog(req.query.title);
		let result;
		logger.debug(`Deletion result: ${formatJson(deleteResult)}`);

		if(deleteResult.deletedCount === 1) {
			result = "Successfully deleted the blog!";
		}
		else {
			result = `The blog wasn't deleted: ${formatJson(deleteResult)}`;
		}

		res.render('editor/editing-result', 
			{
				title: "Deleting blog result",
				result: result
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