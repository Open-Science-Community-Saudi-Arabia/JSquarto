/**
 * @module Logger
 * @subcategory Utilities
 *@category Functional Doc

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
import util from "util";

const logFormat = winston.format.printf((info) => {
    let message = info.message;

    if (typeof message === "object") {
        message = util.inspect(message, { depth: null });
    }

    const logMeta = info.meta ? util.inspect(info.meta, { depth: null }) : "";
    return info.meta
        ? `[${info.timestamp}] | ${info.level}: ${message} ${logMeta}`
        : `[${info.timestamp}] | ${info.level}: ${message}`;
});

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.simple(),
        logFormat,
    ),
    transports: [new winston.transports.Console()],
});

export default logger;
