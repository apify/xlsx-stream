'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = row;

var _cell = require('./cell');

var _cell2 = _interopRequireDefault(_cell);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function row(index, values) {
    return `
        <row r="${index + 1}" spans="1:${values.length}" x14ac:dyDescent="0.2">
            ${values.map((cellValue, cellIndex) => (0, _cell2.default)(cellValue, (0, _utils.getCellId)(index, cellIndex))).join("\n\t\t\t")}
        </row>`;
}