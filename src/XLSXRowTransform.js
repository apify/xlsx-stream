import { Transform } from 'stream';
import { Row, SheetHeader, SheetFooter } from './templates';

/** Class representing a XLSX Row transformation from array to Row. Also adds the necessary XLSX header and footer. */
export default class XLSXRowTransform extends Transform {
    constructor(shouldFormat) {
        super({ objectMode: true });
        this.rowCount = 0;
        this.shouldFormat = shouldFormat;
        this.push(SheetHeader);
    }
    /**
     * Transform array to row string
     */
    _transform(row, encoding, callback) { // eslint-disable-line
        if (!Array.isArray(row)) return callback();

        const xlsxRow = Row(this.rowCount, row, this.shouldFormat);
        this.rowCount++;
        callback(null, xlsxRow);
    }

    _flush(callback) {
        this.push(SheetFooter);
        callback();
    }
}
