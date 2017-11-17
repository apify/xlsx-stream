import Archiver from 'archiver';
import { PassThrough } from 'stream';
import * as templates from './templates';
import XLSXRowTransform from './XLSXRowTransform';

/** Class representing a XLSX Write Stream. */
export default class XLSXWriteStream {
    /**
     * Create new Stream
     */
    constructor() {
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

        this.zip.on('warning', (err) => {
            console.warn(err);
        });

        this.zip.on('error', (err) => {
            console.error(err);
        });

        this.finalize = this.finalize.bind(this);
    }

    setInputStream(stream) {
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

    getOutputStream() {
        return this.zip;
    }
    /**
     * Finalize the zip archive
     */
    finalize() {
        this.sheetStream.end(templates.SheetFooter);
        return this.zip.finalize();
    }
}
