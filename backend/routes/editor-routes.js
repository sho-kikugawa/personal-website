/**
 * @file Routes for pages from the root URL
 * 
 */
const router = require('express').Router();
const editorCtrl = require('../components/editor/editor-controller');

/* GET routers ***************************************************************/
router.get('/create', (req, res) => {
	//res.send("Editing something!");
	res.render('editor/create-blog', {title: "Create a blog"});
});

router.get('/edit', editorCtrl.getEditBlog);

router.get('/login', (req, res) => {
	res.render('editor/login', {title: "Editor login"});
})

/* POST routers **************************************************************/
router.post('/login', editorCtrl.postEditorLogin);

router.post('/create', editorCtrl.postCreateBlog);

router.post('/edit', editorCtrl.postEditBlog);

router.post('/delete', editorCtrl.postDeleteBlog);

module.exports = router;