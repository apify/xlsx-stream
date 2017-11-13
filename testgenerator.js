import Bluebird from 'bluebird';
import express from 'express';
import XLSXWriter from './dist/XLSXWriter';

global.Promise = Bluebird;

const minStringLength = 1;
const maxStringLength = 15;
const availableCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_ :?!';

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

const app = express();

app.get('/', async (req, res) => {
    res.attachment('output.xlsx');
    const xlsxWriter = new XLSXWriter({ stream: res });
    const columns = getColumns(100);
    const rows = 500000;
    let row;
    for (let i = 0; i < rows; i++) {
        row = getTestRowJson(columns);
        xlsxWriter.addRow(row);
    }
    try {
        console.log('finalize');
        await xlsxWriter.finalize();
        console.log('finalized');
    } catch (error) {
        console.log(error);
    }
});

app.listen(3000);
