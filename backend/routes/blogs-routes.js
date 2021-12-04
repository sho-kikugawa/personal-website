/**
 * @file Handles all routes with the root '/blogs/', which primarily handle
 * 		showing a list of blogs.
 */
const router = require('express').Router()
const { getBlogList } = require('../service/blog');
const { handler } = require('../utils/router-utils');

const basepath = '/blogs'

// Will default to the first page
router.get('/', (req, res, next) => {
	handler(getBlogList, req, res, next);
});

// Pages in the list are accessed with /blogs/page/#
router.get('/page/*', (req, res, next) => {
	handler(getBlogList, req, res, next);
});

// Redirect all URLs after /blogs/ to just /blogs
router.get('/*', (req, res) => {res.redirect('/blogs')});

module.exports = {
	router,
	basepath
};