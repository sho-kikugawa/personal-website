/**
 * @file Controller for handling all routes pertaining to listing, searching,
 *       and showing blogs.
 */
const marked = require('marked');
const sanitizer = require('sanitize-html');
const createError = require('http-errors');
const blogService = require(`./blog-service`);
const { logger, formatJson } = require("../../utils/logger");
const { RenderData, renderPage } = require('../../routes/router-utils');

/**
 * Grabs a blog based on the URL. If there is no blog, it redirects to a 404
 * error. Otherwise renders the blog article.
 * @param {Object} req - Request object (from Express)
 * @param {Object} res - Response object (from Express)
 * @param {Object} next - Callback to the handler (from Express)
 */
async function getBlog(req, res, next) {
	const basePath = "/blog/article/";
	let internalTitle = req.originalUrl.substring(basePath.length);

	let blogData = await blogService.getBlog(internalTitle);
	logger.debug(`Retreived blog: ${formatJson(blogData)}`);
	if (blogData === null) {
		logger.debug(`Failed to retrieve blog for ${internalTitle}`);
		next(createError(404));
	}
	else {
		let date = blogData.createdAt.toISOString().replace(/T/, ' ').replace(/\..+/, '');
		date = date.substring(0, 10);
		blogData.dateString = date;
		blogData.content = marked(blogData.content);
		blogData.content = sanitizer(blogData.content, {
			allowedTags: sanitizer.defaults.allowedTags.concat([ 'img' ])
		});

		let data = new RenderData(blogData.title, req);
		data.data = blogData
		renderPage('blog/blog', data, res);
	}
}

/**
 * Gets a list of blogs, with the starting point based on the page number in
 * the URL. If no page number is provided, defaults from page 1. If no blogs
 * are available, flags it for the renderer.
 * @param {Object} req - Request object (from Express)
 * @param {Object} res - Response object (from Express)
 */
async function getBlogList(req, res) {
	let data = new RenderData("Blog list", req);
	const numBlogs = await blogService.getNumBlogs();

	if (numBlogs === 0) {
		
		data.currentPage = -1;
	}
	else {
		const pageStep = 15;
		const blogPages = Math.floor(numBlogs / pageStep) + 1;
		let startAt = 0;
		let pageNum = 1;
		
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
		data.blogs = blogData;
		data.currentPage = pageNum;
		data.lastPage = (blogPages === pageNum);
		data.loggedIn = ('editor' in req.session)
	}
	renderPage('blog/list', data, res);
}

/**
 *  Finds all blogs based on a search term.
 * @param {Object} req - Request object (from Express)
 * @param {Object} res - Response object (from Express)
 */
async function postFindBlogs(req, res) {
	const queryData = {title: { $regex: req.body.searchTerm, $options: "i"}};
	const blogData = await blogService.findBlog(queryData, res);
	logger.debug(`Blogs retrieved from search: ${formatJson(blogDataformatJson)}`);
	logger.debug(`Search term used: ${formatJson(req.bodyformatJson)}`);

	let data = new RenderData("Blog search results", req);
	data.blogs = blogData;
	renderPage('blog/list', data, res);
}

module.exports = {
	getBlog,
	getBlogList,
	postFindBlogs
}