import { expect } from 'chai';
import { Cell } from '../src/templates';
import { getCellId } from '../src/utils';

describe('The Cell function', () => {
    it('Returns correct Cell representation for Date', () => {
        const expectedResult = '<c r="A1" t="n"><v>36525.958333333336</v></c>';
        const result = Cell(new Date('2000-01-01T00:00:00'), getCellId(0, 0));
        expect(result).to.be.equal(expectedResult);
    });

    it('Returns correct Cell representation for string', () => {
        const expectedResult = '<c r="A1" t="inlineStr"><is><t>string</t></is></c>';
        const result = Cell('string', getCellId(0, 0));
        expect(result).to.be.equal(expectedResult);
    });

    it('Returns correct Cell representation for boolean', () => {
        const expectedResult = '<c r="B2" t="inlineStr"><is><t>true</t></is></c>';
        const result = Cell(true, getCellId(1, 1));
        expect(result).to.be.equal(expectedResult);
    });

    it('Returns correct Cell representation for number', () => {
        const expectedResult = '<c r="D3" t="n"><v>12345</v></c>';
        const result = Cell(12345, getCellId(2, 3));
        expect(result).to.be.equal(expectedResult);
    });

    it('Returns correct Cell representation for random type', () => {
        const expectedResult = '<c r="F5" t="inlineStr"><is><t>[object Object]</t></is></c>';
        const result = Cell({ x: 'random' }, getCellId(4, 5));
        expect(result).to.be.equal(expectedResult);
    });
});
