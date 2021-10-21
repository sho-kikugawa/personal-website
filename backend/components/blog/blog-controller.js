const marked = require('marked');
const sanitizer = require('sanitize-html');
const { logger, formatJson } = require("../../utils/logger");
const blogService = require(`./blog-service`);

const PAGE_SKIP_STEP = 15;

async function getBlog(req, res) {
	const BASE_PATH = "/blog/article/";
	let internalTitle = req.originalUrl.substring(BASE_PATH.length);

	if (await blogService.getIfBlogExists(internalTitle) === false)  {
		res.status(404).render('404', {title: 'Page not found'});
	}
	else {
		let blogData = await blogService.getBlog(internalTitle);
		logger.debug(`Retreived blog: ${JSON.stringify(blogData)}`);
		if (blogData !== null) {
			marked.sanitizer = sanitizer.sanitizeHtml;
			blogData.content = marked(blogData.content);
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
			loggedIn: ('account' in req.session)
		});
	}
}

async function getBlogList(req, res) {
	let startAt = 0;
	let currentPage = 1;
	const blogCount = await blogService.getNumBlogs();
	let pages = Math.ceil(blogCount / PAGE_SKIP_STEP);

	if (pages === 0 ) {
		pages = 1;
	}
	if (`startAt` in req.query) {
		const queryNum = Number(req.query.startAt);
		startAt = (isNaN(queryNum)) ? 0 : queryNum;
		currentPage = Math.floor(startAt / PAGE_SKIP_STEP) + 1;
	}

	let blogData = await blogService.findBlogWithSort({}, '-createdAt', startAt);
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
			pages: pages,
			page: currentPage, 
			loggedIn: ('account' in req.session)
		});
}

async function postFindBlogs(req, res) {
	let queryData = {title: { $regex: req.body.searchTerm, $options: "i"}};
	logger.debug(`Searching for a blog using term ${JSON.stringify(req.body, null, 4)}`);
	let blogData = await blogService.findBlog(queryData);
	logger.debug(`Blogs retrieved from search: ${JSON.stringify(blogData, null, 4)}`);
	res.render('blog/list', 
		{
			blogs: blogData, 
			title: `Searched forloggedIn: ('account' in req.session) "${req.body.searchTerm}"`, 
			searchBar: false,
			loggedIn: ('account' in req.session)
		});
}

module.exports = {
	getBlog,
	getBlogList,
	postFindBlogs
}