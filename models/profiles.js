const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const PostsSchema = require('./posts');
const PRIVATE_KEY = require('../configs/keys').PRIVATE_KEY;
process.setMaxListeners(Infinity);

const { Schema } = mongoose;
const UserSchema = new Schema({
	name: String,
	user_name: String,
	gender: String,
	date_of_birth: Date,
	email: { type: String, unique: true, required: true },
	posts: [ PostsSchema ],
	password: { type: String, minlength: 3, required: true },
	isAdmin: Boolean
});

UserSchema.methods.generateAuthToken = () => {
	const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, PRIVATE_KEY);
	return token;
};

mongoose.model('profiles', UserSchema);
