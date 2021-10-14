/**
 * @file Routes for pages showing the blog.
 * 
 */
const router = require('express').Router();
const blogCtrl = require('../components/blog/blog-controller');

const logger = require('../utils/logger').logger;
/* GET routers ***************************************************************/
router.get('/', blogCtrl.getBlog);

router.get('/search', (req, res) => {
	res.render('blog/search');
});

/* POST routers **************************************************************/
router.post('/search', blogCtrl.findBlogs);

module.exports = router;