const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const cors = require('cors');

const cookieKey = require('./configs/keys').COOKIE_KEY;
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(cookieSession({ maxAge: 30 * 24 * 60 * 60 * 1000, keys: [ cookieKey ] }));

mongoose
	.connect('mongodb://localhost/grocklers', { useNewUrlParser: true })
	.then(() => {
		console.log('DB Connected...');
	})
	.catch((err) => {
		console.log(`Can't connect to DB, \n ${err}`);
	});
require('./models/profiles');

require('./routes/user')(app);
app.listen(process.env.PORT || 5000);
app.get('/', (req, res) => {
	res.send('Hello, World!');
});
console.log('Server started...');
