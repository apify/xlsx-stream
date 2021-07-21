/* eslint-disable no-tabs */
import { expect } from 'chai';
import { Readable, PassThrough } from 'stream';
import XLSXRowTransform from '../src/XLSXRowTransform';
import { SheetHeader, SheetFooter } from '../src/templates';

describe('The XLSXRowTransform', () => {
    it('Correctly transforms an array of data into a XLSX row format with header and footer', async () => {
        const expectedResult = `${SheetHeader}
        <row r="1" spans="1:2" x14ac:dyDescent="0.2">
            <c r="A1" t="inlineStr"><is><t>test</t></is></c>
			<c r="B1" t="n"><v>123</v></c>
        </row>${SheetFooter}`;
        const inputStream = Readable.from([['test', 123]]);
        const transform = new XLSXRowTransform();
        const outputStream = new PassThrough();

        const chunks = [];
        outputStream.on('data', (chunk) => {
            chunks.push(chunk);
        });
        const streamResult = new Promise((resolve) =>
            outputStream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8'))));

        inputStream
            .pipe(transform)
            .pipe(outputStream);

        const result = await streamResult;

        expect(result).to.be.equal(expectedResult);
    });
});
