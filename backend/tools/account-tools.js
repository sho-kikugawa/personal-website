const prompt = require('prompt-sync')({sigint: true});
const config = require('../config/config')();
const mongo = require('../loaders/mongo-db');
const mongoose = require('mongoose');
require('../models/editor-schema');
const model = mongoose.model('Editor');

(async() => {
	console.log('Connecting to database...');
	mongo.setup(config.database.mongo);
	await new Promise(resolve => setTimeout(resolve, 100));

	let command = '';

	while(command != 'q') {
		printPrompt();
		command = prompt('> ');
		command = command.toLocaleLowerCase();

		if(command === 'a') {
			console.log(await createEditor());
		}
		if(command === 'l') {
			console.log(await listEditors());
		}
		else if (command === 'd') {
			console.log(await deleteEditor());
		}
	}
	process.exit(1);
})();

function printPrompt() {
	console.log('Enter command:\n',
	'  (A)dd editor\n',
	'  (L)ist editors\n',
	'  (D)elete editor\n',
	'  (Q)uit\n');
}

async function createEditor() {
	const {generateKey, getPasswordHash} = require('../utils/crypto');

	let username = prompt('Input a new username: ');
	let password = prompt('Input password: ', {echo: '*'});
	const salt = generateKey();
	const hash = await getPasswordHash(password, salt);
	const editorData = model.create({
		editorId: generateKey(),
		username: username,
		password: hash
	});

	return editorData;
}

async function listEditors() {
	return await model.find().select('username');
}

async function deleteEditor() {
	let username = prompt('Enter username to delete: ');
	const editorData = await model.deleteOne({username: username});

	return editorData;
}