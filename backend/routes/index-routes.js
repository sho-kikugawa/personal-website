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

router.get('/blogs', blogController.getBlogList);

module.exports = router