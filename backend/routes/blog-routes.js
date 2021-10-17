/**
 * @file Routes for pages showing the blog.
 * 
 */
const router = require('express').Router();
const blogCtrl = require('../components/blog/blog-controller');

const logger = require('../utils/logger').logger;
/* GET routers ***************************************************************/
// Capture all URLs with this base
router.get("/article/*", blogCtrl.getBlog);

/* POST routers **************************************************************/
router.post('/search', blogCtrl.findBlogs);

module.exports = router;