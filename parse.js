const fs = require('fs').promises;
const path = require('path');

async function getHtmlFiles(dir) {
    let files = [];
    const items = await fs.readdir(dir, { withFileTypes: true });
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            files = files.concat(await getHtmlFiles(fullPath));
        } else if (item.name.endsWith('.html')) {
            files.push(fullPath);
        }
    }
    return files;
}

(async () => {
    const htmlFiles = await getHtmlFiles('cable');
    console.log(`Found ${htmlFiles.length} HTML files`);
})();