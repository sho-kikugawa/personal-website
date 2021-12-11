/**
 * @file This define the Mongoose DAL class, which standardizes the DAL 
 * funcion calls for each MongoDB collection. All it needs is the collection
 * name.
 */
const mongoose = require('mongoose');

class MongooseDal {
	constructor(collectionName) {
		this.model = mongoose.model(collectionName);
	}

	async create(data) {
		return await this.model.create({data}).exec();
	}

	async getOne(queryParams, excludes='') {
		return await this.model.findOne(queryParams, excludes).exec();
	}

	async getMany(queryParams, excludes, startAt=0, limit=15) {
		return await this.model.find(queryParams, excludes)
			.skip(startAt)
			.limit(limit)
			.exec();
	}

	async getManySorted(queryParams, excludes, sortBy, startAt=0, limit=15) {
		return await this.model.find(queryParams, excludes)
			.sort(sortBy)
			.skip(startAt)
			.limit(limit)
			.exec();
	}

	async updateOne(queryParams, newData) {
		return await this.model.updateOne(queryParams, newData);
	}

	async updateMany(queryParams, newData) {
		return await this.model.updateMany(queryParams, newData);
	}

	async deleteOne(queryParams) {
		return await this.model.deleteOne(queryParams);
	}

	async deleteMany(queryParams) {
		return await this.model.deleteMany(queryParams);
	}

	/* Utility functions */
	async checkExists(params) {
		return await this.model.exists(params);
	}

	async getDocCount() {
		return await this.model.countDocuments();
	}
}

module.exports = {
	MongooseDal
}