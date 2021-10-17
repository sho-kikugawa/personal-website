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

router.get('/list', (req, res) => {
	res.send(`Showing you a list of blogs to edit`);
});

/* POST routers **************************************************************/
router.post('/create', editorCtrl.createBlog);

router.post('/edit', editorCtrl.postEditBlog);

router.post('/delete', editorCtrl.deleteBlog);

module.exports = router;