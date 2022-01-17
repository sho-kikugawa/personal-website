/**
 * @file Handles all routes with the root '/blogs/', which primarily handle
 * 		showing a list of blogs.
 */
const router = require('express').Router()
const { getBlogList } = require('../service/blog');
const { RenderData } = require('../utils/render-data');
const basepath = '/blogs'

function renderBlogList(req, res, blogListData) {
	let pageData = new RenderData(
		'Blogs',
		req.session,
		res.locals);
	pageData.blogs = blogListData.blogs;
	pageData.currentPage = blogListData.currentPage;
	pageData.lastPage = blogListData.lastPage;
	res.render('blog/list', pageData);
}

// Will default to the first page
router.get('/', (req, res, next) => {
	getBlogList(0)
	.then(blogListData => {
		renderBlogList(req, res, blogListData);
	}) 
	.catch(err => next(err));
});

// Pages in the list are accessed with /blogs/page/#
router.get('/page/*', (req, res, next) => {
	let pageNum = 1;
	if (req.originalUrl.search('page') >-1 ) {
		const basePath = '/blogs/page/';
		pageNum = req.originalUrl.substring(basePath.length);
		pageNum = parseInt(pageNum, 10);

		if (isNaN(pageNum) === true) {
			pageNum = 0;
		}
	}

	getBlogList(pageNum)
	.then(blogListData => {
		renderBlogList(req, res, blogListData);
	}) 
	.catch(err => next(err));
});

// Redirect all URLs after /blogs/ to just /blogs
router.get('/*', (req, res) => {res.redirect('/blogs')});

module.exports = {
	router,
	basepath
};