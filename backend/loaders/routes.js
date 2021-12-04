
const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');

function load(app, routersPath) {
	const files = fs.readdirSync(routersPath);

	files.forEach(file => {
		const filepath = path.join(routersPath, file);
		const router = require(filepath);
		
		app.use(`/${router.basepath}/`, router.router);
		logger.debug(`Loading route /${router.basepath} from ${file}`);
	})
}

module.exports = load;