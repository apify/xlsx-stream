import { expect } from 'chai';
import { PassThrough, Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import unzipper from 'unzipper';
import XLSXTransformStream from '../src/XLSXTransformStream';

const TEST_ROWS_COUNT = 500;

/**
 * @param {Readable} stream - The stream to read from.
 * @param {import('stream').Writable} streamToDrain - The stream on which we expect the drain event.
 * @returns {Promise<number>} Number of bytes read until the drain event was emitted. You should expect that this number is > 0. */
async function readUntilDrain(stream, streamToDrain) {
    // If the stream doesn't need drain, it's probably an error - but let the test assert it, and just read 0
    // "we didn't need to read anything to get the stream to drain :)"
    if (!streamToDrain.writableNeedDrain) return 0;

    let drained = false;
    streamToDrain.on('drain', () => { drained = true; });

    let i = 0;
    while (!drained) {
        const chunk = stream.read();
        expect(chunk).to.not.equal(null); // We read until drain, we should always get some data.
        i += chunk.length;
        // eslint-disable-next-line no-await-in-loop
        await new Promise(resolve => { setTimeout(resolve, 1); }); // Allow data to flow through all the intermediate streams.
    }
    return i;
}

/** @returns {Promise<number>} Number of bytes read until the end of the stream. */
async function readUntilEnd(stream) {
    let i = 0;
    while (true) {
        const chunk = stream.read();
        if (chunk === null) break;
        i += chunk.length;
        // eslint-disable-next-line no-await-in-loop
        await new Promise(resolve => { setTimeout(resolve, 1); }); // Allow data to flow through all the intermediate streams.
    }
    return i;
}

/** @returns {Promise<number>} Number of rows written until backpressure was applied. */
async function writeUntilBackpressure(stream, limit) {
    let i = 0;
    for (; i < limit; i++) {
        const canWrite = stream.write(Array.from({ length: 1000 }, () => `${Math.random()}`));
        if (!canWrite) break; // Backpressure was applied.

        // Add some delay between writes, so the data can flow through all the intermediate streams and ZIP compression.
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => { setTimeout(resolve, 2); });
    }
    return i;
}

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
        // If it works correctly, this takes around 1500ms. If the backpressure is not applied (and thus the write loops must run until completion),
        // it will take longer, but still should fit into this timeout.
        this.timeout(4000);

        const outputStream = new PassThrough();
        const transformStream = new XLSXTransformStream();
        transformStream.pipe(outputStream);

        const WRITE_LIMIT_1 = 450; // usually ~380
        const WRITE_LIMIT_2 = 300; // 150-250

        const writesUntilBackpressure1 = await writeUntilBackpressure(transformStream, WRITE_LIMIT_1);
        const readsUntilDrain1 = await readUntilDrain(outputStream, transformStream);

        const writesUntilBackpressure2 = await writeUntilBackpressure(transformStream, WRITE_LIMIT_2);
        const readsUntilDrain2 = await readUntilDrain(outputStream, transformStream);

        const readsUntilEnd1 = await readUntilEnd(outputStream);

        transformStream.end();
        await new Promise(resolve => { setTimeout(resolve, 10); });
        const readsUntilEnd2 = await readUntilEnd(outputStream);

        console.log('Backpressure test stats:');
        console.log(`${writesUntilBackpressure1} writes; ${readsUntilDrain1} B read until drain`);
        console.log(`${writesUntilBackpressure2} writes; ${readsUntilDrain2} B read until drain`);
        console.log(`${readsUntilEnd1} B read until end; transform input closed; ${readsUntilEnd2} B read until end.`);

        // These limits are quite arbitrary, but we want to test at least _something_. The numbers reliably oscillate between 1.5 and 3.5 MB,
        // so we check a range with some margin. The point is - we can write some nontrivial (but not unlimited) amount of data until backpressure
        // is applied, then we need to read a limited amount until writes are allowed again, then we again read and write, and finally we verify that
        // some data is left buffered in the stream until we finalize reading it.

        expect(writesUntilBackpressure1).to.be.greaterThan(200).and.lessThan(WRITE_LIMIT_1);
        expect(readsUntilDrain1).to.be.greaterThan(1000 * 1000).and.lessThan(4 * 1000 * 1000);
        expect(writesUntilBackpressure2).to.be.greaterThan(10).and.lessThan(WRITE_LIMIT_2);
        expect(readsUntilDrain2).to.be.greaterThan(10 * 1000).and.lessThan(4 * 1000 * 1000);
        expect(readsUntilEnd1).to.be.greaterThan(1000 * 1000).and.lessThan(4 * 1000 * 1000);
        expect(readsUntilEnd2).to.be.greaterThan(5000).and.lessThan(500 * 1000);
    });
});
