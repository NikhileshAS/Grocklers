const jwt = require('jsonwebtoken');
const PRIVATE_KEY = require('../configs/keys').PRIVATE_KEY;
const logger = require('../configs/logger');
module.exports = {
	checkAuthentication: (req, res, next) => {
		const token = req.headers['x-access-token'] || req.headers['authorization'];
		if (!token) return res.status(401).send('Access denied. No token found.');
		try {
			const decoded = jwt.verify(token, PRIVATE_KEY);
			req.user = decoded;
			logger.trace('User decoded');
			next();
		} catch (e) {
			logger.error(e);
			res.status(401).send({ message: 'Invalid Token', e });
		}
	}
};
