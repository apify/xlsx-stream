const fs = require('fs');
const unzip = require('unzip');

fs.createReadStream('./examples/index.xlsx').pipe(
    unzip.Extract({ path: './tools/unzip' })
);
