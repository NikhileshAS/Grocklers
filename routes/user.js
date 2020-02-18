const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = mongoose.model('profiles');
const auth = require('../middlewares/auth').checkAuthentication;
const PRIVATE_KEY = require('../configs/keys').PRIVATE_KEY;

module.exports = (app) => {
	app.post('/api/addUser', async (req, res) => {
		const { name, user_name, date_of_birth, gender, email, password } = req.query;
		console.log(req.query);
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
				res.header('x-auth-token', token).send({
					_id: newUser._id,
					name: newUser.name,
					email: newUser.email
				});
			})
			.catch((error) => {
				console.log(error);
				if (error.errmsg && error.errmsg.includes('duplicate key')) {
					res.send('Email already taken');
				}
				res.send('Error caught');
			});
	});
	app.get('/api/userDetails', auth, async (req, res) => {
		console.log(req.user);
		const user = await User.findById(req.user.id);
		res.send(user);
	});
	app.get('/api/login', async (req, res) => {
		const { email, password } = req.query;
		User.findOne({ email })
			.then(async (obj) => {
				const db_password = obj.password;
				const id = obj._id;
				const isPasswordValid = await bcrypt.compare(password, db_password);
				if (isPasswordValid) {
					return res.send({ token: jwt.sign({ id }, PRIVATE_KEY), user: obj });
				} else {
					res.send('Incorrect Password');
				}
			})
			.catch((err) => {
				console.log(err);
				res.send('Incorrect EMAIL ID');
			});
	});
};
