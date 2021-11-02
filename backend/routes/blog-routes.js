/**
 * @file Routes for pages showing the blog.
 * 
 */
const router = require('express').Router();
const { getBlog, postFindBlogs } = require('../components/blog/blog-controller');
const { handler } = require('./router-utils')

/* GET routers ***************************************************************/
// Capture all URLs with this base
router.get("/article/*", (req, res, next) => {
	handler(getBlog, req, res, next);
});

/* POST routers **************************************************************/
router.post('/search', (req, res, next) => {
	handler(postFindBlogs, req, res, next);
});

module.exports = router;