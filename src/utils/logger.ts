/**
 * @module Logger
 * @subcategory Utilities
 *
 * @description  This module is used to log messages to the console
 * @example
 * import logger from './logger';
 * logger.info('Hello World');
 * logger.error('Hello World');
 * logger.warn('Hello World');
 * logger.debug('Hello World');
 * logger.verbose('Hello World');
 *
 * */

import winston from "winston";

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
    ),
    transports: [new winston.transports.Console()],
});

export default logger;
