/**
 * @file Routes for pages from the root URL
 * 
 */
const router = require('express').Router();
const {	getEditBlog, postEditorLogin, postEditorLogout,	postCreateBlog,
		postEditBlog, postDeleteBlog} 
		= require('../components/editor/editor-controller');
const { handler }= require('./router-utils');

/* GET routers ***************************************************************/
router.get('/create', (req, res) => {
	if ('editor' in req.session) {
		res.render('editor/publish', {
			title: "Create a blog",
			data: {
				title: "",
				subtitle: "",
				content: ""
			},
			newArticle: true
		});
	}
	else {
		res.status(404).render('404', {
			title: 'Page not found'
		});
	}
});

// Pages in the list are accessed with /blogs/page/#
router.get('/edit/*', (req, res, next) => {
	handler(getEditBlog, req, res, next);
});

router.get('/login', (req, res) => {
	res.render('editor/login', {title: "Editor login"});
})

/* POST routers **************************************************************/
router.post('/login', (req, res, next) => {
	handler(postEditorLogin, req, res, next);
});

router.post('/logout', (req, res, next) => {
	handler(postEditorLogout, req, res, next);
});

router.post('/publish', (req, res, next) => {
	handler(postEditBlog, req, res, next);
});

router.post('/delete', (req, res, next) => {
	handler(postDeleteBlog, req, res, next);
});

module.exports = router;