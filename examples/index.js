const fs = require('fs');
const XlsxStream = require('../dist');

const writeStream = fs.createWriteStream('./examples/index.xlsx');

const xlsx = new XlsxStream();
xlsx.outputStream.pipe(writeStream);

const stream = xlsx.createSheetBook('test1');
const stream2 = xlsx.createSheetBook('test2');
const stream3 = xlsx.createSheetBook('third');

stream.write(['test1', 'test2', 'test3']);
stream2.write([1, 2, 3]);
stream3.write([3, 3, 3]);
stream.write([1, 1, 1]);
stream3.write([3, 3, 3]);
stream2.write([2, 2, 2]);

stream.end([1, 1, 1]);
stream2.end();
stream3.end();
