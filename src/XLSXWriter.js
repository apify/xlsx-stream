import fs from 'fs';
import Archiver from 'archiver';
import { PassThrough } from 'stream';
import * as templates from './templates';

/** Class representing a XLSX Write Stream. */
export default class XLSXWriteStream {
    /**
     * Create new Stream
     * @param {object} options - settings for the writable stream
     */
    constructor(options) {
        if (!options.stream) throw new Error('Please provide a stream to write to.');
        this.file = options.file;
        this.onFinish = options.onFinish;
        this.sheetStream = new PassThrough();
        this.zip = Archiver('zip', {
            forceUTC: true,
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

        this.zip.append(this.sheetStream, {
            name: 'xl/worksheets/sheet1.xml',
        });

        this.stream = (options.file && fs.createWriteStream(options.file)) || options.stream;
        this.zip.pipe(this.stream);

        this.stream.on('finish', this.onStreamFinished);

        this.stream.on('close', () => {
            console.log(`${this.zip.pointer()} total bytes`);
            console.log('archiver has been finalized and the output file descriptor has closed.');
            this.finished = true;
        });
        this.stream.on('end', () => {
            console.log('Data has been drained');
        });

        this.zip.on('warning', (err) => {
            console.warn(err);
        });

        this.zip.on('error', (err) => {
            console.error(err);
        });

        this.headers = null;
        this.rowCount = 0;
        this.finalized = false;
    }

    /**
     * Add row to the stream, first row are headers
     * @param {object} data - row in the resulting XLSX represented as object
     */
    addRow(data) {
        if (!this.headers) {
            this.sheetStream.write(templates.SheetHeader);
            this.headers = Object.keys(data);
            this.sheetStream.write(templates.Row(this.rowCount, this.headers));
            this.rowCount++;
        }
        const cells = [];
        this.headers.forEach((header, i) => {
            cells[i] = data[header] || '';
        });
        this.sheetStream.write(templates.Row(this.rowCount, cells));
        this.rowCount++;
    }
    /**
     * Finalize the zip archive
     */
    finalize() {
        if (this.finalized) {
            throw new Error('This XLSX was already finalized.');
        }
        if (!this.headers) {
            throw new Error('You did not write any data');
        }
        this.sheetStream.end(templates.SheetFooter);
        this.finalized = true;

        return this.zip.finalize();
    }
}
