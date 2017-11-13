import cell from './cell';
import { getCellId } from '../utils';

export default function row(index, values) {
    return `
        <row r="${index + 1}" spans="1:${values.length}" x14ac:dyDescent="0.2">
            ${values.map((cellValue, cellIndex) => cell(cellValue, getCellId(index, cellIndex))).join("\n\t\t\t")}
        </row>`;
}
