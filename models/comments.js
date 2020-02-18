const mongoose = require('mongoose');
process.setMaxListeners(Infinity);

const { Schema } = mongoose;
const commentSchema = new Schema({
	text: String,
	profileId: String,
	postId: String
});

mongoose.model('comments', commentSchema);
