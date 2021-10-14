const { logger } = require("../../utils/logger");
const blogService = require(`./blog-service`);

async function getBlog(req, res) {
	logger.debug(`Request URL ${req.originalUrl}`)
	logger.debug(`Request query = ${JSON.stringify(req.query)}`);
	if (!req.query || ("title" in req.query) == false)  {
		res.redirect('/blogs');
	}
	else {
		let blogData = await blogService.getBlog(req.query.title);
		logger.debug(`Retreived blog: ${JSON.stringify(blogData)}`);
		if (blogData !== null) {
			// Do some mark up conversion here
		}
		else {
			blogData = {
				title: "There's no blog here :<",
				content: "No really, there isn't."}
		}
		res.render('blog/blog', blogData);
	}
}

async function getBlogList(req, res) {
	let startAt = 0;
	if (`startAt` in req.query) {
		startAt = req.query.startAt;
	}
	let blogData = await blogService.findBlog({}, startAt);
	logger.debug(`Getting a list of blogs: ${JSON.stringify(blogData, null, 4)}`);
	res.render('blog/list', {blogs: blogData});
}

async function findBlogs(req, res) {
	let queryData = {title: { $regex: req.body.searchTerm, $options: "i"}};
	logger.debug(`Searching for a blog using term ${JSON.stringify(req.body, null, 4)}`);
	let blogData = await blogService.findBlog(queryData);
	logger.debug(`Blogs retrieved from search: ${JSON.stringify(blogData, null, 4)}`);
	res.render('blog/search', {blogs: blogData, searchTerm: req.body.searchTerm});
}

module.exports = {
	getBlog,
	getBlogList,
	findBlogs
}