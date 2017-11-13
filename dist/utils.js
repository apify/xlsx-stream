'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getCellId = getCellId;
exports.escape = escape;
exports.timeoutPromised = timeoutPromised;
const baseString = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function getCellId(rowIndex, cellIndex) {
    let cellXPosition = '';
    let position;
    let remaining = cellIndex;
    do {
        position = remaining % 26;
        cellXPosition = baseString[position] + cellXPosition;
        remaining = Math.floor(remaining / 26) - 1;
    } while (remaining >= 0);
    return `${cellXPosition}${rowIndex + 1}`;
}

function escape(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function timeoutPromised(timeout) {
    return new Promise(resolve => {
        setTimeout(resolve, timeout);
    });
}