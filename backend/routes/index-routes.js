/**
 * @file Routes for pages from the root URL
 * 
 */
const router = require('express').Router()

/* GET routers****************************************************************/
router.get('/', (req, res) => {
	res.render('index', {
		title: "Home", 
		loggedIn: ('editor' in req.session),
	});
})

router.get('/about', (req, res) => {
	res.render('about', {
		title: "About",
		loggedIn: ('editor' in req.session)
	});
})

module.exports = router;