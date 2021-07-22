import Archiver from 'archiver';
import { Transform } from 'stream';
import XLSXRowTransform from './XLSXRowTransform';
import * as templates from './templates';

/** Class representing a XLSX Transform Stream */
export default class XLSXTransformStream extends Transform {
    /**
     * Create a new Stream
     * @param options {Object}
     * @param options.shouldFormat {Boolean} - If set to true writer is formatting cells with numbers and dates
     */
    constructor(options = {}) {
        super({ objectMode: true });
        this.options = options;
        this.initializeArchiver();
        this.rowTransform = new XLSXRowTransform(this.options.shouldFormat);

        this.zip.append(this.rowTransform, {
            name: 'xl/worksheets/sheet1.xml',
        });
    }

    initializeArchiver() {
        this.zip = Archiver('zip', {
            forceUTC: true,
        });

        this.zip.on('data', (data) => {
            this.push(data);
        });

        this.zip.catchEarlyExitAttached = true;

        this.zip.append(templates.ContentTypes, {
            name: '[Content_Types].xml',
        });

        this.zip.append(templates.Rels, {
            name: '_rels/.rels',
        });

        this.zip.append(templates.Workbook, {
            name: 'xl/workbook.xml',
        });

        this.zip.append(templates.Styles, {
            name: 'xl/styles.xml',
        });

        this.zip.append(templates.WorkbookRels, {
            name: 'xl/_rels/workbook.xml.rels',
        });

        this.zip.on('warning', (err) => {
            console.warn(err);
        });

        this.zip.on('error', (err) => {
            console.error(err);
        });
    }

    _transform(row, encoding, callback) {
        if (this.rowTransform.write(row)) {
            process.nextTick(callback);
        } else {
            this.rowTransform.once('drain', callback);
        }
    }

    _flush(callback) {
        this.rowTransform.end();
        this.zip.finalize().then(callback);
    }
}
