import { isDate, isString, isNumber, isBoolean } from 'lodash';
import { sanitize, getNumberFormat, getDateFormat } from '../utils';

export default function (value, cell, shouldFormat) {
    if (isDate(value)) {
        const unixTimestamp = value.getTime();
        const officeTimestamp = (unixTimestamp / 86400000) + 25569;
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
