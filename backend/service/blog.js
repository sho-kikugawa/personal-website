/**
 * @file Service for retrieving blog data from the database, processing it, and
 * returning it to the router so it can take the appropriate action.
 */
const marked = require('marked');
const sanitizer = require('sanitize-html');
const model = require('./mongo-dal').MongooseDal('Blog');
const { logger, formatJson } = require("../../utils/logger");

/**
 * Grabs a blog based on the URL. 
 * @param {string} blogUrl - Full URL the client requested.
 * @returns {Object} Contents of the blog entry in the database to be rendered.
 * Otherwise returns null.
 */
async function getBlog(blogUrl) {
	const basePath = "/blog/article/";
	const internalTitle = blogUrl.substring(basePath.length);

	let blogData = await model.getOne({
		internalTitle: internalTitle
	});
	
	if (blogData === null) {
		logger.debug(`Failed to retrieve blog for ${internalTitle}`);
	}
	else {
		let date = blogData.createdAt.toISOString().replace(/T/, ' ').replace(/\..+/, '');
		date = date.substring(0, 10);
		blogData.dateString = date;
		blogData.content = marked(blogData.content);
		blogData.content = sanitizer(blogData.content, {
			allowedTags: sanitizer.defaults.allowedTags.concat([ 'img' ])
		});
		logger.debug(`Retreived blog: ${formatJson(blogData)}`);
	}
	return blogData;
}

/**
 * Gets a list of blogs, with the starting point based on the page number in
 * the URL. If no page number is provided, defaults from page 1. If no blogs
 * are available, set the current page number to -1 as a flag to the renderer
 * that there's nothing to show.
 * @param {Number} pageNum - Page number to start from.
 * @param {Number} entriesPerPage - How many entries per page there are
 * @returns Returns an array of blog entries.
 */
async function getBlogList(pageNum, entriesPerPage=15) {
	const numBlogs = await model.getDocCount();
	let data = {currentPage: -1};

	if (numBlogs > 0) {
		const blogPages = Math.floor(numBlogs / entriesPerPage) + 1;
		let startAt = 0;

		// Cap the page number to the number maximum number of pages.
		if (pageNum > blogPages) {
			pageNum = blogPages;
		}
		
		startAt = pageNum * entriesPerPage;
		let blogData = await model.findManyWithSort({}, [], '-createdAt', startAt, entriesPerPage);
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
	}
	return data;
}

/**
 * Finds all blogs based on a search term.
 * @param {String} searchTerm - The search term that the user submitted
 * @param {Number} startAt - How many entries to skip in the serach
 * @returns Returns an array of blogs found.
 */
async function postFindBlogs(searchTerm, startAt=0) {
	const queryData = {title: { $regex: searchTerm, $options: "i"}};
	const blogData = model.getMany(queryData, res);
	logger.debug(`Blogs retrieved from search: ${formatJson(blogData)}`);
	logger.debug(`Search term used: ${formatJson(searchTerm)}`);
	return blogData;
}

module.exports = {
	getBlog,
	getBlogList,
	postFindBlogs
}