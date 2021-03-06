/**
 * @file Mongoose schema file for Blog entries.
 */
const mongoose = require('mongoose');

let BlogSchema = new mongoose.Schema({
	internalTitle: {		// Primary key for getting blogs
		type: String,
		trime: true,
		unique: true
	},	// 
	title: String,			// Big bold title
	summary: String,		// Short summary of article
	content: String,		// Markdown content of the article
	tags: [String],			// Array of tags
},
{timestamps: true}); 

mongoose.model(`Blogs`, BlogSchema);