/**
 * @file Service for retrieving blog data from the database, processing it, and
 * returning it to the router so it can take the appropriate action.
 */
const marked = require('marked');
const sanitizer = require('sanitize-html');
const model = new (require('./mongo-dal').MongooseDal)('Blogs');
const { logger, formatJson } = require("../utils/logger");

/*	Filters out everything except letters, numbers, punctuation, and 
	non-visible characters.
*/
const FILTER_REGEX = /[^\p{L}\p{N}\p{P}\p{Z}]/gu;

/**
 * Grabs a blog based on the URL. 
 * @param {string} blogUrl - Full URL the client requested.
 * @returns {Object} Contents of the blog entry in the database to be rendered.
 * Otherwise returns null.
 */
async function getBlog(blogUrl) {
	const basePath = "/blog/article/";
	const internalTitle = blogUrl.substring(basePath.length);

	logger.debug(`${internalTitle}`)

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
		const blogPages = Math.floor(numBlogs / entriesPerPage);
		let startAt = 0;

		// Cap the page number to the number maximum number of pages.
		if (pageNum > blogPages) {
			pageNum = blogPages;
		}
		
		startAt = pageNum * entriesPerPage;
		let blogData = await model.getManySorted({}, [], '-createdAt', startAt, entriesPerPage);
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

/**
 * Handles a post request to create a new blog. If the blog exists, it will 
 * render a page saying such. Otherwise it redirects the user to the blog
 * page.
 * @param {Object} req - Request object (from Express) Uses the body object
 * 		to get the blog title, summary, and contents.
 * @param {Object} res - Response object (from Express)
 */
 async function createBlog(title, summary, content) {
	// Capping title and summary to 255 characters
	title = sanitizer(title.substring(0, 255));
	summary = sanitizer(summary.substring(0, 255));
	const urlTitle = title.replace(FILTER_REGEX, '')
		.trim()
		.replaceAll(' ', '-')
		.toLowerCase();
	logger.debug(`Creating a blog: ${formatJson(req.body)}`);

	let blogData = null;
	if (await blogService.getIfBlogExists(urlTitle) === false) {
		blogData = model.create(
			urlTitle, 
			title,
			summary,
			
			// This will get sanitized on display
			content);
		logger.debug(`blogData if created: ${formatJson(blogData)}`);
	}
	return blogData;
}

/**
 * Gets a blog to edit. If the blog exists, renders the publish page with the
 * data filled out. Otherwise show that the blog does not exist.
 * @param {Object} req - Request object (from Express). Uses the body object
 * 		to get the blog title, summary, and contents.
 * @param {Object} res - Response object (from Express)
 */
async function getBlogData(blogUrl) {
	return await model.getOne({internalTitle: blogUrl});
}

function generatePreview(title, summary, content) {
	let date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	title = sanitizer(title.substring(0, 255));
	summary = sanitizer(summary.substring(0, 255));
	date = date.substring(0, 10);
	let blogData = {
		title: `PREVIEW: ${title}`,
		summary: summary,
		content: marked(content),
		dateString: date
	}
	blogData.content = sanitizer(blogData.content, {
		allowedTags: sanitizer.defaults.allowedTags.concat([ 'img' ])
	});

	logger.debug(`Preview blog data: ${formatJson(blogData)}`);
	return blogData;
}

/**
 * Handles a request to edit a blog. If the blog does not exist or there was a 
 * problem, it renders a page saying such. If the blog was updated, it 
 * redirects to the article page.
 * @param {Object} req - Request object (from Express) Uses the body object
 * 		to get the blog title, summary, and contents.
 * @param {Object} res - Response object (from Express)
 */
async function updateBlog(originalUrl, title, summary, content) {
	let updateData = {updated: false, newUrl: ''};
	title = sanitizer(title.substring(0, 255));
	summary = sanitizer(summary.substring(0, 255));
	const urlTitle = title.replace(FILTER_REGEX, '')
		.trim()
		.replaceAll(' ', '-')
		.toLowerCase();
	logger.debug(`Editing a blog from ${originalUrl}`);

	if (await model.checkExists({internalTitle: originalUrl}) === true) {
		const updatedBlog = {
			internalTitle: urlTitle,
			title: title,
			summary: summary,
			content: content
		}
		const updateResult = await model.updateOne( 
			{internalTitle: originalUrl},
			updatedBlog);
		updateData.updated = updateResult.modifiedCount === 1;
		updateData.newUrl = urlTitle;
		logger.debug(`Update result: ${formatJson(updateResult)}`);
	}
	return updateData;
}

/**
 * Handles a post request to delete the blog.
 * @param {Object} req - Request object (from Express) Uses the body object
 * 		to get the blog title.
 * @param {Object} res - Response object (from Express)
 */
async function deleteBlog (blogUrl) {
	let blogDeleted = false;
	logger.debug(`Deleting a blog: ${formatJson(blogUrl)}`);
	if (await model.checkExists({internalTitle: blogUrl}) === true) {
		const deleteResult = await model.deleteOne({internalTitle: blogUrl});
		logger.debug(`Deletion result: ${formatJson(deleteResult)}`);
		blogDeleted = deleteResult.deletedCount === 1;
	}

	return blogDeleted;
}

module.exports = {
	getBlog,
	getBlogList,
	postFindBlogs,

	createBlog,
	getBlogData,
	generatePreview,
	updateBlog,
	deleteBlog
}