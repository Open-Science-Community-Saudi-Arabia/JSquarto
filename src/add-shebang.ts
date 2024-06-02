import fs from "fs";

const addShebang = (path: string) => {
    const content = fs.readFileSync(path, "utf8");

    if (content.startsWith("#!")) {
        return;
    }

    fs.writeFileSync(path, `#!/usr/bin/env node\n${content}`);

    console.log(`Shebang added to ${path}`);
};

addShebang("bin/src/index.js");
