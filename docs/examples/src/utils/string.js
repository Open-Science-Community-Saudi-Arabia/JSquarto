"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringUtil = void 0;
class StringUtil {
    /**
     * Convert a string to camel case
     *
     * @param str
     *
     * @returns StringUtil
     *
     * @description  This method will convert a string to camel toUpperCase
     * @example
     * StringUtil.convertToCamelCase('hello world') => 'helloWorld'
     * StringUtil.convertToCamelCase('hello-world') => 'helloWorld'
     * StringUtil.convertToCamelCase('hello_world') => 'helloWorld'
     * StringUtil.convertToCamelCase('helloWorld') => 'helloWorld'
     * StringUtil.convertToCamelCase('hello') => 'hello'
     *
     * */
    static convertToPascalCase(str) {
        return str
            .split(/[^a-zA-Z0-9]/)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join("");
    }
    /**
     * Convert a string to camel case
     *
     * @param str
     * @returns string
     *
     * @description  This method will convert a string to camel toUpperCase
     * @example
     * StringUtil.convertToCamelCase('hello world') => 'helloWorld'
     * StringUtil.convertToCamelCase('hello-world') => 'helloWorld'
     * StringUtil.convertToCamelCase('hello_world') => 'helloWorld'
     * StringUtil.convertToCamelCase('helloWorld') => 'helloWorld'
     * StringUtil.convertToCamelCase('hello') => 'hello'
     *
     * */
    static capitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
exports.StringUtil = StringUtil;
