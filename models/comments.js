const mongoose = require('mongoose');
process.setMaxListeners(Infinity);

const { Schema } = mongoose;
const commentSchema = new Schema({
	text: String,
	postId: String
});

mongoose.model('comment', commentSchema);
