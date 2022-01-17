'use strict'

document.getElementById('preview-btn').addEventListener('click', submitPreview);

function submitPreview(e) {
	e.preventDefault();
	let oldAction = document.getElementById('editor-form').action;
	document.getElementById('editor-form').action = "/editor/preview"
	document.getElementById('editor-form').submit();
	document.getElementById('editor-form').action = oldAction
}
