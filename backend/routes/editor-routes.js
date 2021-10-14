/**
 * @file Routes for pages from the root URL
 * 
 */
const router = require('express').Router();
const editorCtrl = require('../components/editor/editor-controller');

/* GET routers ***************************************************************/
router.get('/create', (req, res) => {
	//res.send("Editing something!");
	res.render('editor/editor');
});

router.get('/list', (req, res) => {
	res.send(`Showing you a list of blogs to edit`);
});

/* POST routers **************************************************************/
router.post('/create', editorCtrl.createBlog);

module.exports = router;