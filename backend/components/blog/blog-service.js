/**
 * @file Interface for interaction with the blog database
 */
const mongoose = require('mongoose');
const model = mongoose.model('Blogs');
const {logger, formatJson} = require(`../../utils/logger`);

/**
 * Creates a blog
 * @param {String} internalTitle - Primary key, transformed from the title to
 * 		make it URL friendly
 * @param {String} title - Main title of the blog
 * @param {String} summary - Short summary
 * @param {String} content - Contents of the blog
 * @returns If the blog was created, the Document of the blog. Otherwise null.
 */
async function createBlog(internalTitle, title, summary, content) {
	logger.debug(`Creating a new blog ${title}`);
	
	return await model.create({
		internalTitle: internalTitle,
		title: title,
		summary: summary,
		content: content
	});
}

/**
 * Gets a blog
 * @param {String} internalTitle - URL friendly title of the blog, used to
 * 		search as the primary key.
 * @returns If the blog exists, the Document of the blog. Otherwise null.
 */
async function getBlog(internalTitle) {
	logger.debug(`Getting a blog with internal title ${internalTitle}`);
	return await model.findOne({internalTitle: internalTitle}).exec();
}

/**
 * Checks if the blog exists from the URL friendly title
 * @param {String} internalTitle - URL friendly title of the blog, used to 
 * 		search as the primary key.
 * @returns True if the blog exists, false otherwise.
 */
async function getIfBlogExists(internalTitle) {
	logger.debug(`Checking if blog with internalTitle ${internalTitle} exists`);
	return await model.exists({internalTitle: internalTitle});
}

/**
 * Returns the number of blogs.
 * @returns Number of blogs (though note this counts all Documents)
 */
async function getNumBlogs() {
	return await model.countDocuments();
}

/**
 * Finds blogs based on a query
 * @param {Object} queryData - Object containing the query parameters
 * @param {Number} startAt - Index at which to skip over to
 * @returns An array of all of the blogs that match the query
 */
async function findBlog(queryData, startAt=0) {
	logger.debug(`Finding blog with search term: 
		${formatJson(queryData)}. Starting from ${startAt}`);
	// Search term should have a flag if it's title, content, or both
	// Not sure how much impact this will have in searching the DB
	return await model.find(queryData, ['-content'])
		.skip(startAt)
		.limit(20)
		.exec();
}

/**
 * Finds blogs based on a query but requires a sorting parameter
 * @param {Object} queryData - Object containing the query parameters
 * @param {String} sortBy - Parameter to sort by
 * @param {Number} limit - How many blogs to limit the search to
 * @param {Number} startAt - Index at which to skip over to
 * @returns An array of all blogs that match the query
 */
async function findBlogWithSort(queryData, sortBy, limit=15, startAt=0) {
	logger.debug(`Finding blog with search term: ${formatJson(queryData)}`);
	logger.debug(`Starting from ${startAt}`);
	// Search term should have a flag if it's title, content, or both
	// Not sure how much impact this will have in searching the DB
	return await model.find(queryData,['-content'])
		.sort(sortBy)
		.skip(startAt)
		.limit(limit)
		.exec();
}

/**
 * Updates an existing blog.
 * @param {String} oldInternalTitle - Old URL friendly title, used to find the 
 * 		Document to update.
 * @param {Ojbect} updatedContent - New content to update the Document with
 * @returns An object containing the results of the update.
 */
async function updateBlog(oldInternalTitle, updatedContent) {
	logger.debug(`Updating ${oldInternalTitle} with ${formatJson(updatedContent)}`);
	return await model.updateOne(
		{ internalTitle: oldInternalTitle },
		{
			internalTitle: updatedContent.internalTitle,
			title: updatedContent.title,
			summary: updatedContent.summary,
			content: updatedContent.content
		});
}

/**
 * Deletes a blog
 * @param {String} internalTitle - URL friendly title to find the Document
 * @returns An object containing the results of the deletion.
 */
async function deleteBlog(internalTitle) {
	logger.debug(`Deleting blog ${internalTitle}`);
	return await model.deleteOne({internalTitle: internalTitle});
}

module.exports = {
	createBlog,
	getBlog,
	getIfBlogExists,
	getNumBlogs,
	findBlog,
	findBlogWithSort,
	updateBlog,
	deleteBlog,
}