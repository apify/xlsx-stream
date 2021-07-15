import { expect } from 'chai';
import { Cell } from '../src/templates';
import { getCellId } from '../src/utils';

const describeTestByType = (type) => `Returns correct Cell representation for ${type}`;

describe('The Cell function', () => {
    it(describeTestByType('Date'), () => {
        const expectedResult = '<c r="A1" t="n"><v>36526</v></c>';
        const result = Cell(new Date('2000-01-01T00:00:00+00:00'), getCellId(0, 0));
        expect(result).to.be.equal(expectedResult);
    });

    it(describeTestByType('string'), () => {
        const expectedResult = '<c r="A1" t="inlineStr"><is><t>string</t></is></c>';
        const result = Cell('string', getCellId(0, 0));
        expect(result).to.be.equal(expectedResult);
    });

    it(describeTestByType('boolean'), () => {
        const expectedResult = '<c r="B2" t="inlineStr"><is><t>true</t></is></c>';
        const result = Cell(true, getCellId(1, 1));
        expect(result).to.be.equal(expectedResult);
    });

    it(describeTestByType('number'), () => {
        const expectedResult = '<c r="D3" t="n"><v>12345</v></c>';
        const result = Cell(12345, getCellId(2, 3));
        expect(result).to.be.equal(expectedResult);
    });

    it(describeTestByType('null'), () => {
        const expectedResult = '';
        const result = Cell(null, getCellId(1, 1));
        expect(result).to.be.equal(expectedResult);
    });

    it(describeTestByType('undefined'), () => {
        const expectedResult = '';
        const result = Cell(undefined, getCellId(1, 1));
        expect(result).to.be.equal(expectedResult);
    });

    it(describeTestByType('random type'), () => {
        const expectedResult = '<c r="F5" t="inlineStr"><is><t>[object Object]</t></is></c>';
        const result = Cell({ x: 'random' }, getCellId(4, 5));
        expect(result).to.be.equal(expectedResult);
    });
});
