/**
 * @file Mongoose schema file for Blog entries.
 */
const mongoose = require('mongoose');

let BlogSchema = new mongoose.Schema({
	internalTitle: {
		type: String,
		trim: true,
		unique: true
	},

	title: {
		type: String,
		trim: true,
		default: '',
	},

	summary: {
		type: String,
		trim: true,
		default: '',
	},

	content: {
		type: String,
		default: '',
	},

	tags: [String],
},
{timestamps: true}); 

mongoose.model(`Blogs`, BlogSchema);