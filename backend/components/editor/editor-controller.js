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
	const basePath = "/editor/edit/";
	let internalTitle = req.originalUrl.substring(basePath.length);

	if (await blogService.getIfBlogExists(internalTitle) === false)  {
		res.render('editor/response', {
			title: "Edit failed",
			message: "This blog does not exist :<"
		});
	}
	else {
		let blogData = await blogService.getBlog(internalTitle);
		res.render('editor/publish', 
			{
				title: `Editing: ${blogData.title}`,
				data: blogData
		});
	}
}

async function postCreateBlog(req, res) {
	const urlTitle = req.body.blogTitle.replace(TITLE_REGEX, '').replaceAll(' ', '-').toLowerCase();
	logger.debug(`Creating a blog: ${formatJson(req.body)}`);

	if (await blogService.getIfBlogExists(urlTitle) === true) {
		res.render('editor/response', {
			title: "Edit failed",
			message: "A blog with this title already exists :<"
		})
	}
	else {
		let blogData = await blogService.createBlog(
			urlTitle, 
			sanitizer(req.body.blogTitle),
			sanitizer(req.body.blogSubtitle),
			
			// This will get sanitized on display
			req.body.blogContent);
		logger.debug(`blogData if created: ${formatJson(blogData)}`);
		res.render('editor/response', {message: `Blog posted!`});
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
				editor: editorData.editorId
			})
			req.session.editor = editorData.editorId;
			req.session.save();

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
		res.render('editor/response', {
			title: "Edit failed",
			message: "This blog does not exist :<"
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
		res.render('editor/response', 
			{
				title: "Editing blog result",
				message: resultText
			});
	}
}

async function postDeleteBlog (req, res) {
	logger.debug(`Deleting a blog: ${formatJson(req.query.title)}`);
	if (("title" in req.query) && await blogService.getIfBlogExists(req.query.title) === false) {
		res.render('editor/response', {
			title: "Delete failed",
			message: "This blog does not exist :<"
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

		res.render('editor/response', 
			{
				title: "Deleting blog result",
				message: result
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