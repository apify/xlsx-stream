import { expect } from 'chai';
import {
    getCellId,
    escape,
} from '../src/utils';

describe('The getCellId function', () => {
    it('returns correct ID for first cell and row', () => {
        const expectedResult = 'A1';
        const result = getCellId(0, 0);
        expect(result).to.be.equal(expectedResult);
    });
    it('returns correct ID for 25th cell and 30th row', () => {
        const expectedResult = 'Y30';
        const result = getCellId(29, 24);
        expect(result).to.be.equal(expectedResult);
    });
    it('returns correct ID for 26th cell and 30th row', () => {
        const expectedResult = 'Z30';
        const result = getCellId(29, 25);
        expect(result).to.be.equal(expectedResult);
    });
    it('returns correct ID for 27th cell and 30th row', () => {
        const expectedResult = 'AA30';
        const result = getCellId(29, 26);
        expect(result).to.be.equal(expectedResult);
    });
    it('returns correct ID for 28th cell and 30th row', () => {
        const expectedResult = 'AB30';
        const result = getCellId(29, 27);
        expect(result).to.be.equal(expectedResult);
    });
});

describe('The escape function', () => {
    it('escapes XML entities &, >, <', () => {
        const expectedResult = '&amp;&lt;&gt;';
        const result = escape('&<>');
        expect(result).to.be.equal(expectedResult);
    });
});
