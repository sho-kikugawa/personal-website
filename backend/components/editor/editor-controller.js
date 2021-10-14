const logger = require('../../utils/logger').logger;
const blogService = require('../blog/blog-service');

async function createBlog(req, res) {
	const regex = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;
	const urlTitle = req.body.blogTitle.replace(regex, '').replaceAll(' ', '-').toLowerCase();
	logger.debug(`Creating a blog: ${JSON.stringify(req.body, null, 4)}`);

	if (await blogService.getIfBlogExists(urlTitle) === true) {
		res.render('editor/editing-result', {result: "This blog exists :<"})
	}
	else {
		let blogData = await blogService.createBlog(
			urlTitle, 
			req.body.blogTitle,
			req.body.blogSubtitle,
			req.body.blogContent);
		logger.debug(`blogData if created: ${JSON.stringify(blogData, null, 4)}`);
		res.send(`Congrats, you made a blog!\n\n${JSON.stringify(req.body, null, 4)}`);
	}
}

module.exports = {
	createBlog
};