/**
 * @file Routes for pages from the root URL
 * 
 */
const router = require('express').Router()
const { RenderData } = require('./router-utils');

/* GET routers****************************************************************/
router.get('/', (req, res) => {
	const data = new RenderData('Home', req);
	res.render('index', data);
})

router.get('/about', (req, res) => {
	const data = new RenderData('About', req);
	res.render('about', data);
})

module.exports = router;