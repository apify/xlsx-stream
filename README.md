# XLSX Write Stream [![Build Status](https://travis-ci.org/apifytech/xlsx-stream.svg)](https://travis-ci.org/apifytech/xlsx-stream) [![npm version](https://badge.fury.io/js/xlsx-write-stream.svg)](http://badge.fury.io/js/xlsx-write-stream)

XLSX Write Stream is a streaming writer for XLSX spreadsheets. Its purpose is to replace CSV for large exports, because using
CSV in Excel is very buggy and error prone. It's very efficient and can quickly write hundreds of thousands of rows with
low memory usage.

XLSX Write Stream does not support formatting, charts, comments and a myriad of
other [OOXML](https://en.wikipedia.org/wiki/Office_Open_XML) features. It's strictly an CSV replacement.

## Installation

```node
npm i 'xlsx-write-stream'
```

## Example Usage

```node
import XLSXWriteStream from 'xlsx-write-stream';


// Initialize the writer
const xlsxWriter = new XLSXWriteStream();

// Set input stream. Input stream needs to implement Stream.Readable interface
// and each chunk should be an array of values (only string, date and number are supported value types)
xlsxWriter.setInputStream(inputStream);

// Get output stream. This will return a stream of XLSX file data.
const xlsxStream = xlsxWriter.getOutputStream();

// do something with the output, like write it into file or send it as HTTP response
const writeStream = fs.createWriteStream('file.xlsx');
xlsxStream.pipe(writeStream);
```

## License

This package is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
