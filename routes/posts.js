const mongoose = require('mongoose');
const User = mongoose.model('profiles');
const Post = mongoose.model('posts');
const auth = require('../middlewares/auth').checkAuthentication;
const logger = require('../configs/logger');

module.exports = (app) => {
	app.post('/api/addPost', auth, (req, res) => {
		const { title, description } = req.query;
		const user = req.user;
		new Post({
			title,
			description,
			postBy: user.id
		})
			.save()
			.then((post) => {
				logger.trace(post);
				User.findByIdAndUpdate(user.id, { $push: { posts: post } })
					.then((user) => {
						logger.trace(user);
						res.status(200).send('Post added successfully');
					})
					.catch((err) => {
						logger.error('Updating user after adding the post failed.');
						logger.error(err);
						logger.debug('New post added successfully, but user has not updated with the posts');
						logger.debug(post);
						res.status(200).send('Post added succesfully,but User has not updated');
					});
			});
	});
};
