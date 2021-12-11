/**
 * @file Handles all routes for the root '/blog/'. This handles mostly showing
 * 		a blog.
 */
const router = require('express').Router();
const { RenderData } = require('../utils/render-data');
const { getBlog, postFindBlogs } = require('../service/blog');

const basepath = '/blog'
/* GET routers ***************************************************************/
// Capture all URLs with this base
router.get("/article/*", (req, res, next) => {
	getBlog(req.originalUrl)
	.then(blogData => {
		if(blogData !== null) {
			let pageData = new RenderData(
				`${blogData.title}`,
				req.session,
				res.locals);
			pageData.data = blogData;
			res.render('blog/blog', pageData);
		}
		else {
			res.redirect('/404');
		}
	}) 
	.catch(err => next(err));
});

/* POST routers **************************************************************/
// router.post('/search', (req, res, next) => {
// 	handler(postFindBlogs, req, res, next);
// });

module.exports = {
	router,
	basepath
};