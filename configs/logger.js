const logger = require('bunyan');

module.exports = logger.createLogger({
	name: 'Grocklers Server',
	streams: [
		{ level: 'debug', path: './logs/appDebugLogs.log' },
		{ level: 'error', path: './logs/appErrorLogs.log' },
		{ level: 'info', path: './logs/appInfoLogs.log' },
		{ level: 'trace', path: './logs/appTraceLogs.log' },
		{ level: 'warn', path: './logs/appWarnLogs.log' }
	]
});
