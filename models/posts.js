const mongoose = require('mongoose');
process.setMaxListeners(Infinity);

const { Schema } = mongoose;
const CommentSchema = require('./comments');
const postsSchema = new Schema({
	title: String,
	description: String,
	likes: [ String ],
	comments: [ CommentSchema ],
	postBy: Schema.Types.ObjectId
});
mongoose.model('posts', postsSchema);
