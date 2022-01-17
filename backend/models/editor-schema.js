/**
 * @file Mongoose schema file for Editors.
 */
const mongoose = require('mongoose');

let EditorSchema = new mongoose.Schema({
	editorId: {
		type: String,
		unique: true,
	},

	username: {
		type: String,
		trim: true,
		unique: true
	},
	 
	password: String,

	lastLogin: {
		type: Date,
		default: Date.now()
	},
},
{timestamps: true}); 

mongoose.model(`Editor`, EditorSchema);