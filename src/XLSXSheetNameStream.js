import Through from 'through2';

function formatSheetNameRow(name, index) {
    return `        <sheet name="${name}" sheetId="${index}" r:id="rId${index}"/>
    `;
}

export default function createSheetNameStream() {
    const stream = Through({ objectMode: true }, (chunk, encoding, callback) => {
        if (typeof chunk === 'string') {
            callback(null, chunk);
        } else if (chunk.name && chunk.index) {
            const { name, index } = chunk;
            const data = formatSheetNameRow(name, index);
            callback(null, data);
        } else {
            callback(new Error('chunk must be string or object with properties `name` and `index` in sheet name stream'));
        }
    });
    return stream;
}
