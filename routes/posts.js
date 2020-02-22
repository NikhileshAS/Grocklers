const mongoose = require('mongoose');
const User = mongoose.model('profiles');
const Post = mongoose.model('posts');
const Comment = mongoose.model('comment');
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
				User.findByIdAndUpdate(user.id, { $push: { posts: post._id } })
					.then((user) => {
						logger.trace(user);
						res.status(200).send({ message: 'Post added successfully', user: post });
					})
					.catch((err) => {
						logger.error('Updating user after adding the post failed.');
						logger.error(err);
						logger.debug('New post added successfully, but user has not updated with the posts');
						logger.debug(post);
						res.status(500).send({ message: 'Post added succesfully,but User has not updated', err });
					});
			});
	});
	//Get POSTID from the request
	app.post('/api/addLike', auth, (req, res) => {
		const user = req.user;
		const { postId } = req.query;
		Post.findById(postId).then((post) => {
			if (!post['likes'].includes(user.id)) {
				post['likes'].push(user.id);
				Post.findByIdAndUpdate(postId, { $set: { likes: post['likes'] } })
					.then(() => {
						logger.trace('Added like');
						logger.trace(post);
						res.status(200).send({ message: 'Added likes successfully', post });
					})
					.catch((err) => {
						logger.error(`Couldn't add like to the post ${postId}`);
						logger.error(err);
						res.status(500).send({ message: 'Failed adding likes' });
					});
			} else {
				post['likes'].splice(post['likes'].indexOf(user.id), 1);
				Post.findByIdAndUpdate(postId, { $set: { likes: post['likes'] } }).then((post) => {
					logger.trace('Like removed');
					res.status(200).send({ message: 'Already liked the post. Successfully removed the like', post });
				});
			}
		});
	});
	app.get('/api/showAllPosts', auth, (req, res) => {
		const user = req.user;
		User.findById(user.id)
			.then(async (user) => {
				let posts = [];
				let fetchPosts = async () => {
					for (let index = 0; index < user['friends'].length; index++) {
						let friend = await User.findById(user['friends'][index]);
						for (let index2 = 0; index2 < friend['posts'].length; index2++) {
							posts.push(await Post.findById(friend['posts'][index2]));
						}
					}
				};
				await fetchPosts();
				logger.trace('Posts added succesfully');
				logger.trace(posts);
				res.status(200).send({ message: 'Posts fetched successfully', posts });
			})
			.catch((err) => {
				logger.error("Couldn't fetch users");
				logger.error(err);
				res.status(500).send({ message: 'Error on fetching users.', err });
			});
	});
	//Get POSTID from the request
	app.delete('/api/deletePost', auth, (req, res) => {
		const user = req.user;
		const { postId } = req.query;
		User.findById(user.id).then((user) => {
			user['posts'].forEach((post, index) => {
				if (post['_id'] == postId) {
					Post.findByIdAndDelete(postId)
						.then((post) => {
							logger.trace('Post deleted');
							logger.trace(post);
							user['posts'].splice(index, 1);
							User.findByIdAndUpdate(user.id, { $set: { posts: user['posts'] } })
								.then((profile) => {
									res.status(200).send({ message: `Post deleted successfully`, post, profile });
								})
								.catch((err) => {
									logger.error('Delete post failed');
									logger.err(err);
									res
										.status(500)
										.send({ message: 'Internal server error on deleting the post', err });
								});
						})
						.catch((err) => {
							logger.error('Post not found');
							logger.error(err);
							res.status(500).send({ message: 'Post not found.', err });
						});
				}
			});
		});
	});
	//Get POSTID from the request
	app.post('/api/addComment', auth, (req, res) => {
		const user = req.user;
		const { postId, text } = req.query;
		comment = new Comment({ postId, text });
		Post.findByIdAndUpdate(postId, { $push: { comments: comment } })
			.then((post) => {
				logger.trace('Comment added');
				logger.trace();
				res.status(200).send({ message: 'Successfully added comment', post });
			})
			.catch((err) => {
				logger.error('Failed to add comment');
				logger.error(err);
				res.status(500).send({ message: 'Failed to add comment', err });
			});
	});
};
