const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieKey = require('./configs/keys').COOKIE_KEY;
const logger = require('./configs/logger');
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(cookieSession({ maxAge: 30 * 24 * 60 * 60 * 1000, keys: [ cookieKey ] }));

mongoose
	.connect('mongodb://localhost/grocklers', { useNewUrlParser: true })
	.then(() => {
		logger.trace('Connected to DB');
		console.log('DB Connected...');
	})
	.catch((err) => {
		logger.error("Can't connect to DB");
		console.log(`Can't connect to DB, \n ${err}`);
	});
require('./models/profiles');

require('./routes/user')(app);
require('./routes/posts')(app);
app.listen(process.env.PORT || 5000);
app.get('/', (req, res) => {
	res.send('Hello, World!');
});
console.log('Server started...');
