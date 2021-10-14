const mongoose = require('mongoose');

let EditorSchema = new mongoose.Schema({
	username: {
		type: String,
		trime: true,
		unique: true
	},	// 
	password: String,
	lastLogin: {
		type: Date,
		default: Date.now()
	},
},
{timestamps: true}); 

mongoose.model(`Editor`, EditorSchema);