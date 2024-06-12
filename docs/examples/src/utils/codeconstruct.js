"use strict";
/**
 * @module ConstructIdentifier
 * @subcategory Utilities
 * @category Functional Doc
 *
 * @description
 * The class called ConstructIdentifier, contains methods to identify different types of code constructs
 * (such as functions, variables, classes, and modules) within a line of code.
 * These methods help in extracting and determining the names associated with each construct type.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstructIdentifier = void 0;
/**
 * Utility class for identifying constructs (functions, variables, classes, modules) in code.
 */
class ConstructIdentifier {
    // Get the name of the module construct
    /**
     * @description  Retrieves the name of the module construct from a given line of code.
     *
     * @param {string} line - The line of code to parse.
     * @returns {string | null} The name of the module construct if found, otherwise null.
     */
    static getExportsConstructName(line) {
        const exportsRegex = /^exports\.(\w+)\s*=\s*function\s*\(.*\)|exports.(\w+)\s*=\s*\([\s\S]*?\)\s*=>|exports.(\w+)\s*=\s*async\s*\([\s\S]*?\)\s*=>/;
        const match = line.match(exportsRegex);
        return match
            ? match
                .slice(1)
                .find((group) => group !== undefined && group !== null) ||
                null
            : null;
    }
    // Get the name of the function construct
    /**
     * @description  Retrieves the name of the function construct from a given line of code.
     *
     * @param {string} line - The line of code to parse.
     * @returns {string | null} The name of the function construct if found, otherwise null.
     */
    static getFunctionConstructName(line) {
        // Check for async arrow functions i.e  const variableX = async (param1, param2) => {}
        let match = line.match(/const\s+(\w+)\s*=\s*async\s*\(.*\)\s*=>/);
        if (match) {
            return match[1] || null;
        }
        // Check for plain arrow function i.e const variableX = (param1, param2) => {}
        match = line.match(/const\s+(\w+)\s*=\s*\(.*\)\s*=>/);
        if (match) {
            return match[1] || null;
        }
        // Check for const something = function() {}
        match = line.match(/const\s+(\w+)\s*=\s*function\s*\(/);
        if (match) {
            return match[1] || null;
        }
        const functionRegex = /(async\s+)?function\s+(\w+)|const\s+(\w+)\s*=\s*async\s*\(.*\)\s*=>|\(([\s\S]*?)\)\s*=>|(\w+)\s*=\s*function\s*\(([\s\S]*?)\)|(\w+)\s*=\s*\(([\s\S]*?)\)\s*=>|\w+\s*=\s*async\s*\(([\s\S]*?)\)\s*=>|\w+\s*=\s*function\s*[\s\S]*?\((([\s\S]*?))\)|\w+\s*=\s*\(([\s\S]*?)\)\s*=>/;
        match = line.match(functionRegex);
        if (match) {
            const functionName = match
                .slice(2)
                .find((group) => group !== undefined && group !== null) ||
                null;
            // Functions may be defined as exports, so we need to check for that
            const exportRegex = /exports\.(\w+)\s*=\s*function\s*\(.*\)|exports.(\w+)\s*=\s*\([\s\S]*?\)\s*=>|exports.(\w+)\s*=\s*async\s*\([\s\S]*?\)\s*=>/;
            const exportMatch = line.match(exportRegex);
            if (exportMatch) {
                return (exportMatch
                    .slice(1)
                    .find((group) => group !== undefined && group !== null) || null);
            }
            const arrowFunctionRegex = /\(([\s\S]*?)\)\s*=>/;
            const arrowFunctionMatch = line.match(arrowFunctionRegex);
            return arrowFunctionMatch
                ? arrowFunctionMatch[1] || null
                : functionName || null;
        }
        return null;
    }
    // Get the name of the variable construct
    /**
     * Retrieves the name of the variable construct from a given line of code.
     *
     * @param {string} line - The line of code to parse.
     * @returns {string | null} The name of the variable construct if found, otherwise null.
     */
    static getVariableConstructName(line) {
        const variableRegex = /\b(const|let|var)\s+(\w+)/;
        const match = line.match(variableRegex);
        return match ? match[2] || null : null;
    }
    // Get the name of the class construct
    /**
     * @description Retrieves the name of the class construct from a given line of code.
     *
     * @param {string} line - The line of code to parse.
     * @returns {string | null} The name of the class construct if found, otherwise null.
     */
    static getClassConstructName(line) {
        const classRegex = /\bclass\s+(\w+)/;
        const match = line.match(classRegex);
        return match ? match[1] || null : null;
    }
    /**
     * @description Identifies the type of construct (function, variable, class, module, other) from the given code text.
     *
     * @param {string} text - The code text to analyze.
     * @returns {ConstructType} The type of construct identified.
     */ static getConstructType(text) {
        // Check if the remaining code contains a function declaration
        const functionRegex = /(\basync\s+)?\bfunction\b|^exports\.\w+\s*=\s*async\s*\(.*\)\s*=>|\bconst\b\s*\w+\s*=\s*async\s*\(.*\)\s*=>|\b\w+\s*=\s*function\s*\(|\b\w+\s*=\s*\([\s\S]*?\)\s*=>|\b\w+\s*=\s*async\s*\([\s\S]*?\)\s*=>|\b\w+\s*=\s*function\s*[\s\S]*?\(|\b\w+\s*=\s*\([\s\S]*?\)\s*=>/;
        const functionMatch = functionRegex.test(text);
        if (functionMatch) {
            return "function";
        }
        const moduleRegex = /@module\s+(.*)/g;
        const moduleMatch = moduleRegex.exec(text);
        if (moduleMatch) {
            return "module";
        }
        // Check if the remaining code contains a variable declaration
        const variableRegex = /\b(const\b|\blet\b|\bvar\b)\s+(\w+)/;
        const variableMatch = variableRegex.test(text);
        if (variableMatch) {
            return "variable";
        }
        // Check if the remaining code contains a class declaration
        const classRegex = /\bclass\s+(\w+)/;
        const classMatch = classRegex.test(text);
        if (classMatch) {
            return "class";
        }
        return "other";
    }
    /**
     * @description  Retrieves the name of the construct from the given code text.
     *
     * @param {string} text - The code text to analyze.
     * @returns {string | null} The name of the construct if found, otherwise null.
     */
    static getConstructName(text) {
        const type = this.getConstructType(text);
        switch (type) {
            case "function":
                return this.getFunctionConstructName(text);
            case "variable":
                return this.getVariableConstructName(text);
            case "class":
                return this.getClassConstructName(text);
            case "module":
                return this.getExportsConstructName(text);
            default:
                return null;
        }
    }
}
exports.ConstructIdentifier = ConstructIdentifier;
