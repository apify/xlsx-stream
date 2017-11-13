'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (value, cell) {
    if ((0, _lodash.isDate)(value)) {
        const unixTimestamp = value.getTime();
        const officeTimestamp = unixTimestamp / 86400000 + 25569;
        return `<c r="${cell}" t="n"><v>${officeTimestamp}</v></c>`;
    } else if ((0, _lodash.isString)(value)) {
        return `<c r="${cell}" t="inlineStr"><is><t>${(0, _utils.escape)(value)}</t></is></c>`;
    }
    return `<c r="${cell}" t="n"><v>${value}</v></c>`;
};

var _lodash = require('lodash');

var _utils = require('../utils');