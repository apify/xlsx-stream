import Through from 'through2';

function formatSheetRelRow(index) {
    return `    <Relationship Id="rId${
        index}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${
        index}.xml"/>
    `;
}

function formatSheetStyleRelRow(index) {
    return `    <Relationship Id="rId${index}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
    `;
}

export { formatSheetStyleRelRow };
export default function createSheetRelStream() {
    const stream = Through({ objectMode: true }, (chunk, encoding, callback) => {
        if (typeof chunk === 'string') {
            callback(null, chunk);
        } else if (typeof chunk === 'number') {
            const data = formatSheetRelRow(chunk);
            callback(null, data);
        } else {
            callback(new Error('chunk must be string or number in sheet relationship stream'));
        }
    });
    return stream;
}
