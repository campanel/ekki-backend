const { createLogger, format, transports } = require('winston');
const env = process.env.NODE_ENV || 'development';

const logger = createLogger({
  // change level if in dev environment versus production
  level: env === 'development' ? 'debug' : 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new transports.Console(),
    new transports.File({filename: 'app.log'})
  ]
});

module.exports = logger;

