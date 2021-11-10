const marked = require('marked');
const sanitizer = require('sanitize-html');
const createError = require('http-errors');
const blogService = require(`./blog-service`);
const { logger, formatJson } = require("../../utils/logger");
const { RenderData, renderPage } = require('../../routes/router-utils');

async function getBlog(req, res, next) {
	const basePath = "/blog/article/";
	let internalTitle = req.originalUrl.substring(basePath.length);

	if (await blogService.getIfBlogExists(internalTitle) === false)  {
		next(createError(404));
	}
	else {
		let blogData = await blogService.getBlog(internalTitle);
		logger.debug(`Retreived blog: ${JSON.stringify(blogData)}`);
		if (blogData !== null) {
			blogData.content = marked(blogData.content);
			blogData.content = sanitizer(blogData.content);
		}
		else {
			logger.debug(`Failed to retrieve blog for ${internalTitle}`);
			blogData = {
				title: "There's no blog here :<",
				content: "No really, there isn't."};
		}
		let data = new RenderData(blogData.title, req);
		data.data = blogData
		renderPage('blog/blog', data, res);
	}
}

async function getBlogList(req, res) {
	const pageStep = 15;
	const numBlogs = await blogService.getNumBlogs();
	const blogPages = Math.floor(numBlogs / pageStep) + 1;
	let startAt = 0;
	let pageNum = 1;

	if (numBlogs === 0) {
		let data = new RenderData("Blog list", req);
		data.currentPage = -1;
		renderPage('blog/list', data, res);
	}
	else {
		// Parse the page number from the URL
		if (req.originalUrl.search("page") > -1) {
			const basePath = "/blogs/page/";
			pageNum = req.originalUrl.substring(basePath.length);
			pageNum = parseInt(pageNum, 10);

			if (isNaN(pageNum) === false) {
				startAt = (pageNum - 1) * pageStep;
			}
			else {
				pageNum = 1;
			}
		}

		// Cap the page number to the number maximum number of pages.
		if (pageNum > blogPages) {
			pageNum = blogPages;
		}

		let blogData = await blogService.findBlogWithSort({}, '-createdAt', pageStep, startAt);
		blogData.forEach(blogEntry => {
			if (blogEntry.createdAt === undefined) {
				return;
			}
			let date = blogEntry.createdAt.toISOString().replace(/T/, ' ').replace(/\..+/, '');
			date = date.substring(0, 10);
			blogEntry.dateString = date;
		})

		let data = new RenderData("Blog list", req);
		data.blogs = blogData;
		data.currentPage = pageNum;
		data.lastPage = (blogPages === pageNum);
		data.loggedIn = ('editor' in req.session)
		renderPage('blog/list', data, res);
	}
}

async function postFindBlogs(req, res) {
	let queryData = {title: { $regex: req.body.searchTerm, $options: "i"}};
	logger.debug(`Searching for a blog using term ${JSON.stringify(req.body, null, 4)}`);
	let blogData = await blogService.findBlog(querydata, res);
	logger.debug(`Blogs retrieved from search: ${JSON.stringify(blogData, null, 4)}`);

	let data = new RenderData("Blog search results", req);
	data.blogs = blogData;
	renderPage('blog/list', data, res);
}

module.exports = {
	getBlog,
	getBlogList,
	postFindBlogs
}