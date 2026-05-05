import { expect } from 'chai';
import { Readable, Writable } from 'stream';
import fs from 'fs';
import path from 'path';
import unzipper from 'unzipper';
import XLSXTransformStream from '../src/XLSXTransformStream';

const TEST_ROWS_COUNT = 500;

describe('The XLSXTransformStream', () => {
    it(`The transformed xlsx file corresponds to the snapshot xlsx file (${TEST_ROWS_COUNT} rows)`, async () => {
        const snapshotFiles = {};
        await fs.createReadStream(path.resolve(__dirname, 'test.xlsx'))
            .pipe(unzipper.Parse())
            .on('entry', async (entry) => {
                snapshotFiles[entry.path] = await entry.buffer();
            })
            .promise();

        const inputStream = new Readable({ objectMode: true });
        const testFiles = {};

        for (let i = 0; i < TEST_ROWS_COUNT; i++) {
            inputStream.push(['Testing', i + 1]);
        }
        inputStream.push(null);

        await inputStream
            .pipe(new XLSXTransformStream())
            .pipe(unzipper.Parse())
            .on('entry', async (entry) => {
                testFiles[entry.path] = await entry.buffer();
            })
            .promise();

        Object.keys(testFiles).map((key) => {
            expect(snapshotFiles[key] && testFiles[key].equals(snapshotFiles[key])).to.be.equal(true);
        });
    });

    it('Properly applies backpressure', async function () {
        // If it works correctly, this takes 2.5s. If the backpressure is not applied (and thus the loop must run until completion),
        // it will take longer, but still should fit into this timeout.
        this.timeout(8000);

        // an output stream that only accepts a single chunk (+ internal Node.js buffers),
        // and then applies backpressure, without ever accepting more data
        const stuckDestination = new Writable({
            // eslint-disable-next-line no-unused-vars
            write(_chunk, _encoding, _callback) {
                // never call the callback
            },
        });
        const transformStream = new XLSXTransformStream();
        transformStream.pipe(stuckDestination);

        const LIMIT = 600; // the backpressure is applied after around 376 rows - let's have some margin
        let i = 0;
        for (; i < LIMIT; i++) {
            const canWrite = transformStream.write(Array.from({ length: 1000 }, () => `${Math.random()}`));
            if (!canWrite) break; // backpressure was applied

            // Add some delay between writes, so the data can flow through all the intermediate streams and ZIP compression.
            // eslint-disable-next-line no-await-in-loop
            await new Promise((resolve) => { setTimeout(resolve, 5); });
        }
        expect(i).to.be.lessThan(LIMIT); // expect that backpressure was applied before writing all ${LIMIT} rows
    });
});
