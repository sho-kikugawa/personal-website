/**
 * @file Routes for pages from the root URL
 * 
 */
const router = require('express').Router()
const { getBlogList } = require('../components/blog/blog-controller');
const { handler } = require('./router-utils');

/* GET routers****************************************************************/
router.get('/', (req, res) => {
	res.render('index', {
		title: "Home", 
		loggedIn: ('sessionID' in req.session),
	});
})

router.get('/about', (req, res) => {
	res.render('about', {
		title: "About",
		loggedIn: ('sessionID' in req.session)
	});
})

// Will default to the first page
router.get('/blogs', (req, res, next) => {
	handler(getBlogList, req, res, next);
});

// Pages in the list are accessed with /blogs/page/#
router.get('/blogs/page/*', (req, res, next) => {
	handler(getBlogList, req, res, next);
});

// Redirect all URLs after /blogs/ to just /blogs
router.get('/blogs/*', (req, res) => {res.redirect('/blogs')});

module.exports = router;