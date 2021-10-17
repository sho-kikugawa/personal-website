const marked = require('marked');
const sanitizer = require('sanitize-html');
const { logger } = require("../../utils/logger");
const blogService = require(`./blog-service`);

async function getBlog(req, res) {
	logger.debug(`Request URL ${req.originalUrl}`)
	const BASE_PATH = "/blog/article/";
	let internalTitle = req.originalUrl.substring(BASE_PATH.length);

	if (await blogService.getIfBlogExists(internalTitle) === false)  {
		res.redirect('/blogs');
	}
	else {
		let blogData = await blogService.getBlog(internalTitle);
		logger.debug(`Retreived blog: ${JSON.stringify(blogData)}`);
		if (blogData !== null) {
			marked.sanitizer = sanitizer.sanitizeHtml;
			blogData.content = marked(blogData.content);
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
	let blogData = await blogService.findBlogWithSort({}, '-createdAt', startAt);
	logger.debug(`Getting a list of blogs: ${JSON.stringify(blogData, null, 4)}`);
	blogData.forEach(blogEntry => {
		if (blogEntry.createdAt === undefined) {
			return;
		}
		let date = blogEntry.createdAt
			.toISOString().replace(/T/, ' ').replace(/\..+/, '');
		date = date.substring(0, 10);
		logger.debug(`${blogEntry.title}'s date: ${date}'`);
		blogEntry.dateString = date;
	})
	res.render('blog/list', {blogs: blogData, title: "Blog list", searchBar: true});
}

async function findBlogs(req, res) {

	let queryData = {title: { $regex: req.body.searchTerm, $options: "i"}};
	logger.debug(`Searching for a blog using term ${JSON.stringify(req.body, null, 4)}`);
	let blogData = await blogService.findBlog(queryData);
	logger.debug(`Blogs retrieved from search: ${JSON.stringify(blogData, null, 4)}`);
	res.render('blog/list', 
		{
			blogs: blogData, 
			title: `Searched for "${req.body.searchTerm}"`, 
			searchBar: false
		});
}

module.exports = {
	getBlog,
	getBlogList,
	findBlogs
}