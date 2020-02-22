const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = mongoose.model('profiles');
const Posts = mongoose.model('posts');
const auth = require('../middlewares/auth').checkAuthentication;
const PRIVATE_KEY = require('../configs/keys').PRIVATE_KEY;
const logger = require('../configs/logger');

module.exports = (app) => {
	app.post('/api/addUser', async (req, res) => {
		const { name, user_name, date_of_birth, gender, email, password } = req.query;
		logger.debug(req.query);
		newUser = new User({
			name,
			user_name,
			date_of_birth,
			gender,
			email,
			password
		});
		newUser.password = await bcrypt.hash(newUser.password, 10);
		newUser
			.save()
			.then(() => {
				const token = newUser.generateAuthToken();
				res.header('x-auth-token', token).status(201).send({
					_id: newUser._id,
					name: newUser.name,
					email: newUser.email
				});
			})
			.catch((error) => {
				logger.error(error);
				if (error.errmsg && error.errmsg.includes('duplicate key')) {
					res.status(409).send('Email already taken');
				}
				res.status(409).send('Error caught');
			});
	});
	app.get('/api/userDetails', auth, async (req, res) => {
		logger.trace(req.user);
		const user = await User.findById(req.user.id);
		let fetchPosts = async () => {
			for (let index = 0; index < user['posts'].length; index++) {
				user['posts'][index] = await Posts.findById(user['posts'][index]);
			}
		};
		await fetchPosts();
		logger.trace('Details fetched');
		logger.trace(user);
		res.status(200).send({ user });
	});
	app.get('/api/login', async (req, res) => {
		const { email, password } = req.query;
		User.findOne({ email })
			.then(async (obj) => {
				const db_password = obj.password;
				const id = obj._id;
				const isPasswordValid = await bcrypt.compare(password, db_password);
				if (isPasswordValid) {
					return res
						.status(200)
						.send({ token: jwt.sign({ id }, PRIVATE_KEY, { expiresIn: 60 * 60 }), user: obj });
				} else {
					res.status(400).send('Incorrect Password');
				}
			})
			.catch((err) => {
				logger.error(err);
				res.status(400).send('Incorrect EMAIL ID', err);
			});
	});
	app.post('/api/addFriend', auth, async (req, res) => {
		const user = req.user;
		const { profileId } = req.query;
		User.findByIdAndUpdate(user.id, { $push: { friends: profileId } })
			.then(() => {
				User.findByIdAndUpdate(profileId, { $push: { friends: user.id } }).then(() => {
					logger.trace('Added Friend');
					res.status(200).send({ message: 'Added friend' });
				});
			})
			.catch((err) => {
				logger.error('Adding friend was unsuccesful');
				logger.error(err);
				res.status(500).send({ message: 'Adding friend was unsuccessful', err });
			});
	});

	//LOGOUT can't be done using JWT. Wait until the token expires or clear the token on client.
};
