import { isDate, isString, isNumber, isBoolean } from 'lodash';
import { sanitize } from '../utils';

// 25569 = Days between 1970/01/01 and 1900/01/01 (min date in Windows Excel)
const OFFSET_DAYS = 25569;

// 24 * 60 * 60 * 1000
const MILLISECONDS_IN_ONE_DAY = 86400000;

export default function (value, cell) {
    if (isDate(value)) {
        const unixTimestamp = value.getTime();
        const officeTimestamp = (unixTimestamp / MILLISECONDS_IN_ONE_DAY) + OFFSET_DAYS;
        return `<c r="${cell}" t="n"><v>${officeTimestamp}</v></c>`;
    } else if (isString(value)) {
        return `<c r="${cell}" t="inlineStr"><is><t>${sanitize(value)}</t></is></c>`;
    } else if (isBoolean(value)) {
        return `<c r="${cell}" t="inlineStr"><is><t>${value}</t></is></c>`;
    } else if (isNumber(value)) {
        return `<c r="${cell}" t="n"><v>${value}</v></c>`;
    } else if (value) {
        return `<c r="${cell}" t="inlineStr"><is><t>${sanitize(`${value}`)}</t></is></c>`;
    }
    return '';
}
