const fs = require('fs');
const path = require('path');
const prompt = require('prompt-sync')({sigint: true});
const config = require('../config/config')();
const mongo = require('../loaders/mongo-db');

(async() => {
	const dbSchemas = []; 
	fs.readdirSync('./models').forEach(file => {
		dbSchemas.push(path.join(__dirname, '../models', file));
	})
	console.log('Connecting to database...')
	mongo.setup(config.database, dbSchemas);
	await new Promise(resolve => setTimeout(resolve, 100));

	let command = '';

	while(command != 'q') {
		printPrompt();
		command = prompt('> ');
		command = command.toLocaleLowerCase();

		if(command === 'a') {
			console.log(await createAccount());
		}
		else if (command === 'd') {
			console.log(await deleteAccount());
		}
	}
	process.exit(1);
})();

function printPrompt() {
	console.log('Enter command:\n',
	'  (A)dd account\n',
	'  (D)elete account\n',
	'  (Q)uit\n');
}

async function createAccount() {
	const {generateKey, getPasswordHash} = require('../utils/crypto');
	const model = new (require('../service/mongo-dal').MongooseDal)('Editor');

	let username = prompt('Input a new username: ');
	let password = prompt('Input password: ', {echo: '*'});
	const salt = generateKey();
	const hash = await getPasswordHash(password, salt);
	const accountData = await model.create({
		editorId: generateKey(),
		username: username,
		password: hash
	});

	return accountData;
}

async function deleteAccount() {
	const model = new (require('../service/mongo-dal').MongooseDal)('Editor');

	let username = prompt('Enter username to delete: ');
	const accountData = await model.deleteOne({username: username});

	return accountData;
}