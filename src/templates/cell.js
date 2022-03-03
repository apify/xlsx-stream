import { isDate, isString, isNumber, isBoolean } from 'lodash';
import { sanitize, getNumberFormat, getDateFormat } from '../utils';

// 25569 = Days between 1970/01/01 and 1900/01/01 (min date in Windows Excel)
const OFFSET_DAYS = 25569;

// 24 * 60 * 60 * 1000
const MILLISECONDS_IN_ONE_DAY = 86400000;

export default function (value, cell, shouldFormat) {
    if(cell.length==2 && cell[1]=='1'){
        return `<c r="${cell}" s="7" t="inlineStr"><is><t>${(0, _utils.sanitize)(value)}</t></is></c>`;
    }
    if (isDate(value)) {
        const unixTimestamp = value.getTime();
        const officeTimestamp = (unixTimestamp / MILLISECONDS_IN_ONE_DAY) + OFFSET_DAYS;
        const maybeFormat = shouldFormat && getDateFormat();
        return `<c r="${cell}" t="n"${maybeFormat ? ` s="${maybeFormat}"` : ''}><v>${officeTimestamp}</v></c>`;
    } else if (isString(value)) {
        return `<c r="${cell}" t="inlineStr"><is><t>${sanitize(value)}</t></is></c>`;
    } else if (isBoolean(value)) {
        return `<c r="${cell}" t="inlineStr"><is><t>${value}</t></is></c>`;
    } else if (isNumber(value)) {
        const maybeFormat = shouldFormat && getNumberFormat(value);
        return `<c r="${cell}" t="n"${maybeFormat ? ` s="${maybeFormat}"` : ''}><v>${value}</v></c>`;
    } else if (value) {
        return `<c r="${cell}" t="inlineStr"><is><t>${sanitize(`${value}`)}</t></is></c>`;
    }
    return '';
}
