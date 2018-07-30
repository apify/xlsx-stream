import events from 'events';
import Archiver from 'archiver';
import { PassThrough } from 'stream';
import * as templates from './templates';
import XLSXRowTransform from './XLSXRowTransform';
import creatSheetNameStream from './XLSXSheetNameStream';
import createSheetRelStream from './XLSXSheetRelStream';

/** Class representing a XLSX Write Stream. */
export default class XLSXWriteStream extends events {
    /**
     * Create new Stream
     */
    constructor() {
        super();
        this.sheetCount = 0;
        this.sheetStreams = {};
        this.streams = {};
        this.streamDone = {};

        this.zip = Archiver('zip', {
            forceUTC: true,
        });
        this.zip.catchEarlyExitAttached = true;

        // append statics
        this.zip.append(templates.ContentTypes, {
            name: '[Content_Types].xml',
        });

        this.zip.append(templates.Rels, {
            name: '_rels/.rels',
        });

        this.zip.append(templates.Styles, {
            name: 'xl/styles.xml',
        });

        // append streams
        this.sheetNameStream = creatSheetNameStream();
        this.sheetNameStream.write(templates.SheetNameHeader);
        this.zip.append(this.sheetNameStream, {
            name: 'xl/workbook.xml',
        });

        this.sheetRelStream = createSheetRelStream();
        this.sheetRelStream.write(templates.SheetRelHeader);
        this.zip.append(this.sheetRelStream, {
            name: 'xl/_rels/workbook.xml.rels',
        });

        this.zip.on('warning', (err) => {
            this.emit('warning', err);
        });

        this.zip.on('error', (err) => {
            this.emit('error', err);
        });
    }
    /**
     * @param {String} name sheet name
     * @param {Stream?} stream readable or transform stream or empty but data to stream is must be Array
     * @returns {Stream} stream returned is the stream that you can invoke stream.write([...])
     */
    createSheetBook(name, stream) {
        // handle params
        if (typeof name !== 'string') {
            stream = name;
            name = '';
        }

        // check if correct stream type
        if (!stream.pipe) {
            return this.emit('error', new Error('stream must be readable or transform stream'));
        }

        // check if exist
        if (name && this.streams[name]) {
            return this.streams[name];
        }

        // sheet counts to name sheet{count}.xml
        this.sheetCount++;
        // default name
        name = name || `sheet${this.sheetCount}`;

        // write sheet name
        this.sheetNameStream.write({ name, index: this.sheetCount });
        // write sheet relationship
        this.sheetRelStream.write(this.sheetCount);

        // new stream transform Array to xml string
        const rowStream = new XLSXRowTransform();

        // if pass stream then pipe and later return `stream`
        if (stream) {
            stream.pipe(rowStream);
        } else {
            stream = rowStream;
        }

        // sheet stream to add to `zip`
        const sheetStream = new PassThrough();
        // add sheet xml
        const filename = `xl/worksheets/sheet${this.sheetCount}.xml`;
        this.zip.append(sheetStream, {
            name: filename,
        });

        // pipe to sheet stream
        rowStream.pipe(sheetStream);

        // first wirte `header` to stream
        sheetStream.write(templates.SheetHeader);

        // store stream related object
        this.sheetStreams[name] = sheetStream;
        this.streams[name] = stream;
        this.streamDone[name] = false;

        // when `end` emitted , try invoke `finalize`
        rowStream.on('end', () => {
            this.streamDone[name] = true;
            this._finalize();
        });

        // proxy origin `end` function cause we need to add `footer` to sheet stream
        const originEnd = sheetStream.end;

        sheetStream.end = function endProxy(chunk) {
            if (chunk) {
                rowStream.write(chunk);
            }
            originEnd.call(sheetStream, templates.SheetFooter);
        };

        // return a stream that we can directly `write` data
        return stream;
    }
    // depracated...
    __setInputStream(stream) {
        const toXlsxRow = new XLSXRowTransform();
        const transformedStream = stream.pipe(toXlsxRow);
        this.sheetStream = new PassThrough();
        this.sheetStream.write(templates.SheetHeader);
        transformedStream.on('end', this.finalize);
        // stream.on('data', () => console.log('Input stream data'));
        transformedStream.pipe(this.sheetStream);
        this.zip.append(this.sheetStream, {
            name: 'xl/worksheets/sheet1.xml',
        });
    }
    // use getter
    get outputStream() {
        return this.zip;
    }
    /**
     * Finalize the zip archive
     * private
     */
    _finalize() {
        let flag = true;
        const names = Object.keys(this.streamDone);
        names.forEach(name => {
            if (!this.streamDone[name]) {
                flag = false;
            }
        });

        if (!flag) {
            return;
        }

        this.sheetNameStream.end(templates.SheetNameFooter);
        this.sheetRelStream.end(templates.SheetRelFooter);

        this.zip.finalize();
    }
}
