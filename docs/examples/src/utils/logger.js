"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const logger = winston_1.default.createLogger({
    level: "info",
    format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
    transports: [new winston_1.default.transports.Console()],
});
exports.default = logger;
