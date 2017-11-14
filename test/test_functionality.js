var _fs = require('fs');
var _fs2 = _interopRequireDefault(_fs);
var _stream = require('stream');
var _XLSXWriteStream = require('./XLSXWriteStream');
var _XLSXWriteStream2 = _interopRequireDefault(_XLSXWriteStream);
var _timeoutPromised = require('./utils').timeoutPromised;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const minStringLength = 1;
const maxStringLength = 15;
const availableCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_ :?!';

class StringToArray extends _stream.Transform {
    constructor() {
        super({ objectMode: true });
    }
    _transform(text, encoding, callback) {
        // eslint-disable-line
        callback(null, text.split('__'));
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomString() {
    const result = [];
    const stringLength = getRandomInt(minStringLength, maxStringLength);
    let charPosition;
    for (let i = 0; i < stringLength; i++) {
        charPosition = getRandomInt(0, availableCharacters.length);
        result.push(availableCharacters[charPosition]);
    }
    return result.join('');
}

function getTestRowJson(columns) {
    const rowObject = {};
    columns.forEach(column => {
        rowObject[column] = getRandomString();
    });
    return rowObject;
}

function getColumns(count) {
    const columns = [];
    for (let i = 0; i < count; i++) {
        columns[i] = `Column ${i}`;
    }
    return columns;
}

async function main() {
    const columns = getColumns(100);
    const rows = 500;
    try {
        const xlsxWriter = new _XLSXWriteStream2.default();
        const stringToArray = new StringToArray();
        const inputStream = new _stream.PassThrough().pipe(stringToArray);
        const outputStream = xlsxWriter.getOutputStream();
        xlsxWriter.setInputStream(inputStream);
        let row;
        for (let i = 0; i < rows; i++) {
            row = getTestRowJson(columns);
            if (i === 0) {
                inputStream.write(Object.keys(row).join('__'));
            }
            inputStream.write(Object.values(row).join('__'));
        }
        inputStream.end();
        const writeStream = _fs2.default.createWriteStream(`${__dirname}/../generated.xlsx`);
        writeStream.on('close', () => {
            console.log('Archiver has been finalized and the output file descriptor has closed.');
        });

        writeStream.on('end', () => {
            console.log('Data has been drained');
        });
        outputStream.pipe(writeStream);
    } catch (error) {
        console.log(error);
    }
}
main();
