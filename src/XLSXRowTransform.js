import { Transform } from 'stream';
import { Row } from './templates';

/** Class representing a XLSX Row transformation from array to Row. */
export default class XLSXRowTransform extends Transform {
    constructor() {
        super({ objectMode: true });
        this.rowCount = 0;
    }
    /**
     * Transform array to row string
     */
    _transform(row, encoding, callback) { // eslint-disable-line
        const xlsxRow = Row(this.rowCount, row);
        this.rowCount++;
        callback(null, xlsxRow);
    }
}
