const marked = require('marked');
const sanitizer = require('sanitize-html');
const { logger, formatJson } = require("../../utils/logger");
const blogService = require(`./blog-service`);

async function getBlog(req, res) {
	const basePath = "/blog/article/";
	let internalTitle = req.originalUrl.substring(basePath.length);

	if (await blogService.getIfBlogExists(internalTitle) === false)  {
		res.status(404).render('404', {title: 'Page not found'});
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
		res.render('blog/blog', {
			title: blogData.title,
			data: blogData,
			loggedIn: ('sessionID' in req.session)
		});
	}
}

async function getBlogList(req, res) {
	const pageStep = 15;
	const numBlogs = await blogService.getNumBlogs();
	const blogPages = Math.floor(numBlogs / pageStep) + 1;
	let startAt = 0;
	let pageNum = 1;

	if (numBlogs === 0) {
		res.render('blog/list', 
			{	currentPage: -1, 
				title: "Blog list", 
				loggedIn: ('sessionID' in req.session)
			});
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

		res.render('blog/list', 
			{	blogs: blogData, 
				title: "Blog list", 
				currentPage: pageNum,
				lastPage: (blogPages === pageNum),
				loggedIn: ('sessionID' in req.session)
			});
	}
}

async function postFindBlogs(req, res) {
	let queryData = {title: { $regex: req.body.searchTerm, $options: "i"}};
	logger.debug(`Searching for a blog using term ${JSON.stringify(req.body, null, 4)}`);
	let blogData = await blogService.findBlog(queryData);
	logger.debug(`Blogs retrieved from search: ${JSON.stringify(blogData, null, 4)}`);
	res.render('blog/list', 
		{
			blogs: blogData, 
			title: `Searched forloggedIn: ('sessionID' in req.session) "${req.body.searchTerm}"`, 
			searchBar: false,
			loggedIn: ('sessionID' in req.session)
		});
}

module.exports = {
	getBlog,
	getBlogList,
	postFindBlogs
}