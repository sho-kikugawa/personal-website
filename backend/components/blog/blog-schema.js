const mongoose = require('mongoose');

let BlogSchema = new mongoose.Schema({
	internalTitle: {		// Primary key for getting blogs
		type: String,
		trime: true,
		unique: true
	},	// 
	title: String,			// Big bold title
	subtitle: String,		// Summary
	content: String,		// Markdown content of the article
	tags: [String],			// Array of tags
},
{timestamps: true}); 

mongoose.model(`Blogs`, BlogSchema);