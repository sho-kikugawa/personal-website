/**
 * @file Routes for pages from the root URL. 
 * 
 */
const router = require('express').Router()
const { RenderData, renderPage} = require('./router-utils');
const { logger } = require('../utils/logger')

/* GET routers****************************************************************/
router.get('/', (req, res) => {
	const data = new RenderData('Home', req);
	renderPage('index', data, res);
})

router.get('/about', (req, res) => {
	const data = new RenderData('About', req);
	renderPage('about', data, res);
})

module.exports = router;