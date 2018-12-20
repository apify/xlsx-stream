import { expect } from 'chai';
import {
    getCellId,
    sanitize,
    getDateFormat,
    getNumberFormat,
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

describe('The sanitize function', () => {
    it('escapes XML entities &, >, <', () => {
        const expectedResult = '&amp;&lt;&gt;';
        const result = sanitize('&<>');
        expect(result).to.be.equal(expectedResult);
    });

    it('removes invalid XML characters', () => {
        const expectedResult = '';
        const result = sanitize('\u001A');
        expect(result).to.be.equal(expectedResult);
    });
});

describe('Number formats function', () => {
    it('returns 5 for integer length 11+', () => {
        const expected = 5;
        expect(getNumberFormat(10000000000)).to.be.equal(expected);
        expect(getNumberFormat(1000000000000)).to.be.equal(expected);
        expect(getNumberFormat(-10000000000)).to.be.equal(expected);
        expect(getNumberFormat(-1000000000000)).to.be.equal(expected);
    });

    it('returns 1 for integer from 0 to 999', () => {
        const expected = 1;
        expect(getNumberFormat(0)).to.be.equal(expected);
        expect(getNumberFormat(-10)).to.be.equal(expected);
        expect(getNumberFormat(999)).to.be.equal(expected);
        expect(getNumberFormat(-1)).to.be.equal(expected);
    });

    it('returns 2 for float from 0 to 999', () => {
        const expected = 2;
        expect(getNumberFormat(1.22)).to.be.equal(expected);
        expect(getNumberFormat(-10.1231)).to.be.equal(expected);
        expect(getNumberFormat(999.1)).to.be.equal(expected);
        expect(getNumberFormat(-1.2222222)).to.be.equal(expected);
    });

    it('returns 3 for integer from 1000', () => {
        const expected = 3;
        expect(getNumberFormat(1000)).to.be.equal(expected);
        expect(getNumberFormat(1000000000)).to.be.equal(expected);
        expect(getNumberFormat(-2500)).to.be.equal(expected);
        expect(getNumberFormat(-38000)).to.be.equal(expected);
    });

    it('returns 4 for floats from 1000', () => {
        const expected = 4;
        expect(getNumberFormat(1000.12)).to.be.equal(expected);
        expect(getNumberFormat(10000000.1)).to.be.equal(expected);
        expect(getNumberFormat(-2500.4232)).to.be.equal(expected);
        expect(getNumberFormat(-3800.10012)).to.be.equal(expected);
    });
});

describe('Date formats function', () => {
    it('Should return 6 for all dates', () => {
        const expected = 6;
        expect(getDateFormat(new Date())).to.be.equal(expected);
    });
});
