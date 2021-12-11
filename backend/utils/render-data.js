/**
 * @file Utility fucntions related to routing and web page rendering.1
 */
class RenderData {
	constructor(title, session, locals) {
		this.headTitle = `${title} | Sho and Tell`;
		this.title = `${title}`;
		this.loggedIn = 'editor' in session;
		this.scriptNonce = locals.scriptNonce;
		this.styleNonce = locals.styleNonce;
		console.log(session)
	}

	updateTitle(title) {
		this.headTitle = `${title} | Sho and Tell`;
		this.title = `${title}`;
	}
}

module.exports = {
	RenderData
};