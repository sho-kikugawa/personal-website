/**
 * @file Routes for pages from the root URL
 * 
 */
const router = require('express').Router()
const blogController = require('../components/blog/blog-controller');

/* GET routers****************************************************************/
router.get('/', (req, res) => {
	res.render('index', {
		title: "Home", 
		loggedIn: ('account' in req.session),
	});
})

router.get('/about', (req, res) => {
	res.render('about', {
		title: "About",
		loggedIn: ('account' in req.session)
	});
})

// Will default to the first page
router.get('/blogs', blogController.getBlogList);

// Pages in the list are accessed with /blogs/page/#
router.get('/blogs/page/*', blogController.getBlogList);

// Redirect all URLs after /blogs/ to just /blogs
router.get('/blogs/*', (req, res) => {res.redirect('/blogs')});

module.exports = router