const logger = require('../../utils/logger').logger;
const formatJson = require('../../utils/logger').formatJson;
const blogService = require('../blog/blog-service');
const editorService = require('./editor-service');

const TITLE_REGEX = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;


async function getEditBlog(req, res) {
	if (!req.query || ('title' in req.query) === false) {
		res.send("No blog title to edit");
	}
	else if (await blogService.getIfBlogExists(req.query.title) === false ){
		res.send("No blog with that name exists");
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
	logger.debug(`Creating a blog: ${JSON.stringify(req.body, null, 4)}`);

	if (await blogService.getIfBlogExists(urlTitle) === true) {
		res.render('editor/editing-result', {result: "This blog exists :<"})
	}
	else {
		let blogData = await blogService.postCreateBlog(
			urlTitle, 
			req.body.blogTitle,
			req.body.blogSubtitle,
			req.body.blogContent);
		logger.debug(`blogData if created: ${JSON.stringify(blogData, null, 4)}`);
		res.send(`Congrats, you made a blog!\n\n${JSON.stringify(req.body, null, 4)}`);
	}
}

async function postEditorLogin(req, res) {
	if (!req.body.editorUsername || !req.body.editorPassword) {
		res.send("No username or password");
	}
	else {
		let editorData = await editorService.editorLogin(
			req.body.editorUsername, 
			req.body.editorPassword);
		
		if (editorData !== null) {
			logger.debug(`Editor data from login: ${formatJson(editorData)}`);
			res.cookie(process.env.COOKIE_NAME, 'value', {
				account: editorData.editorId
			});
			req.session.account = editorData.editorId;
			req.session.save();
			logger.debug(`Creating session for ${editorData.editorId}`);
			logger.debug(`Session: ${formatJson(req.session)}`);
			res.send(`Login successful! ${formatJson(req.session)}`)
		}
		else {
			res.send(`Login unsuccessful`);
		}
	}
}

async function postEditorLogout (req, res) {
	req.session = null;
	res.redirect('/');
}

async function postEditBlog(req, res) {
	const urlTitle = req.body.title.replace(TITLE_REGEX, '').replaceAll(' ', '-').toLowerCase();
	logger.debug(`Editing a blog: ${JSON.stringify(req.body, null, 4)}`);

	if (urlTitle !== req.query.title && await blogService.getIfBlogExists(urlTitle) === true) {
		res.render('editor/editing-result', {result: "This blog exists :<"})
	}
	else {
		let updatedBlog = {
			internalTitle: urlTitle,
			title: req.body.title,
			subtitle: req.body.subtitle,
			content: req.body.content
		}
		let updateResult = await blogService.updateBlog(req.query.title, updatedBlog);
		logger.debug(`Update result: ${JSON.stringify(updateResult, null, 4)}`);
		res.render('editor/editing-result', 
			{
				title: "Editing blog result",
				result: JSON.stringify(updateResult, null, 4)
			});
	}
}

async function postDeleteBlog (req, res) {
	if (("title" in req.query) && await blogService.getIfBlogExists(req.query.title) === false) {
		res.render('editor/editing-result', {result: "This blog does not exist :<"})
	}
	else {
		logger.debug(`Deleting a blog: ${JSON.stringify(req.query.title, null, 4)}`);
		let deteleResult = await blogService.postDeleteBlog(req.query.title);
		logger.debug(`Deletion result: ${JSON.stringify(deteleResult, null, 4)}`);
		res.render('editor/editing-result', 
			{
				title: "Deleting blog result",
				result: JSON.stringify(deteleResult, null, 4)
			});
	}
}

module.exports = {
	getEditBlog,
	postEditorLogin,
	postEditorLogout,
	postCreateBlog,
	postEditBlog,
	postDeleteBlog
};