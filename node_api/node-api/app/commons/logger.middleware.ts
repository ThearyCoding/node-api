import * as winston from 'winston'
/*logger middleware used to record every Logs. ./logs/app.log file where all Logs save.
/* Logs used to track  errors.
*/
const options = {
  file: {
    level: 'info',
    filename: './logs/app.log',
    handleExceptions: true,
    json: true,
    maxsize: 5000000,
    maxFiles: 5,
    colorize: true
  },
  console: {
    level: 'debug',
    handleException: true,
    json: true,
    colorize: true
  }
}
const logger = winston.createLogger({
  transports: [new winston.transports.File(options.file), new winston.transports.Console(options.console)],
  exitOnError: false
})
export { logger }
