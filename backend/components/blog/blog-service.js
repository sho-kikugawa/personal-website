const mongoose = require('mongoose');
const model = mongoose.model('Blogs');
const logger = require(`../../utils/logger`).logger;

async function createBlog(linkTitle, title, subtitle, content) {
	logger.debug(`Creating a new blog ${title}`);
	
	return await model.create({
		internalTitle: linkTitle,
		title: title,
		subtitle: subtitle,
		content: content
	});
}

async function getBlog(internalTitle) {
	// Gets a blog via its internal title. 
	logger.debug(`Getting a blog with internal title ${internalTitle}`);
	return await model.findOne({internalTitle: internalTitle}).exec();
}

async function getIfBlogExists(linkTitle) {
	return await model.exists({internalTitle: linkTitle});
}

async function findBlog(queryData, startAt=0) {
	logger.debug(`Finding blog with search term: 
		${JSON.stringify(queryData, null, 4)}. Starting from ${startAt}`);
	// Search term should have a flag if it's title, content, or both
	// Not sure how much impact this will have in searching the DB
	return await model.find(queryData,
		['-content']).exec();
}

async function updateBlog(title, subtitle, content) {
	logger.debug(`Updating blog`);
}

async function deleteBlog(internalTitle) {
	logger.debug(`Deleting blog ${internalTitle}`);
	return await model.deleteOne({
		internalTitle: internalTitle
	})
}

module.exports = {
	createBlog,
	getBlog,
	getIfBlogExists,
	findBlog,
	updateBlog,
	deleteBlog,
}