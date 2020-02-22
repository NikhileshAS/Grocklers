const mongoose = require('mongoose');
const User = mongoose.model('profiles');
const auth = require('../middlewares/auth').checkAuthentication;
const logger = require('../configs/logger');

module.exports = (app) => {
	app.get('/api/searchProfile', (req, res) => {
		const { searchString } = req.query;
		User.find({
			$or: [
				{ name: { $regex: new RegExp(searchString, 'i') } },
				{ user_name: { $regex: new RegExp(searchString, 'i') } }
			]
		})
			.then((profile) => {
				res.status(200).send(profile);
				console.log();
			})
			.catch((err) => {
				logger.error(err);
				res.status(400).send({ message: 'No profiles found', profiles: [] });
			});
	});
};
