import { sanitize, getNumberFormat, getDateFormat } from '../utils';

// 25569 = Days between 1970/01/01 and 1900/01/01 (min date in Windows Excel)
const OFFSET_DAYS = 25569;

// 24 * 60 * 60 * 1000
const MILLISECONDS_IN_ONE_DAY = 86400000;

export default function (value, cell, shouldFormat) {
    if (value instanceof Date) {
        const unixTimestamp = value.getTime();
        const officeTimestamp = (unixTimestamp / MILLISECONDS_IN_ONE_DAY) + OFFSET_DAYS;
        const maybeFormat = shouldFormat && getDateFormat();
        return `<c r="${cell}" t="n"${maybeFormat ? ` s="${maybeFormat}"` : ''}><v>${officeTimestamp}</v></c>`;
    } else if (typeof value === 'string') {
        return `<c r="${cell}" t="inlineStr"><is><t>${sanitize(value)}</t></is></c>`;
    } else if (typeof value === 'boolean') {
        return `<c r="${cell}" t="inlineStr"><is><t>${value}</t></is></c>`;
    } else if (typeof value === 'number') {
        const maybeFormat = shouldFormat && getNumberFormat(value);
        return `<c r="${cell}" t="n"${maybeFormat ? ` s="${maybeFormat}"` : ''}><v>${value}</v></c>`;
    } else if (value) {
        return `<c r="${cell}" t="inlineStr"><is><t>${sanitize(`${value}`)}</t></is></c>`;
    }
    return '';
}
