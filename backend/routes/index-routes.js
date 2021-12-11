/**
 * @file Routes for pages from the root URL. 
 * 
 */
const router = require('express').Router()
const { RenderData } = require('../utils/render-data');
const { logger, formatJson } = require('../utils/logger'); 

const basepath = '/';

/* GET routers****************************************************************/
router.get('/', (req, res) => {
	const data = new RenderData('Home', req.session, res.locals);
	res.render('index', data);
})

router.get('/about', (req, res) => {
	const data = new RenderData('About', req.session, res.locals);
	res.render('about', data);
})

module.exports = {
	router,
	basepath
};