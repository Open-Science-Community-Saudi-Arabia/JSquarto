"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const addShebang = (path) => {
    const content = fs_1.default.readFileSync(path, "utf8");
    if (content.startsWith("#!")) {
        return;
    }
    fs_1.default.writeFileSync(path, `#!/usr/bin/env node\n${content}`);
    console.log(`Shebang added to ${path}`);
};
addShebang("bin/src/jsq.js");
