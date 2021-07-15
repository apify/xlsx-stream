# XLSX Write Stream library

[![Build Status](https://travis-ci.org/apify/xlsx-stream.svg?branch=master)](https://travis-ci.org/apify/xlsx-stream) [![npm version](https://badge.fury.io/js/xlsx-write-stream.svg)](http://badge.fury.io/js/xlsx-write-stream)

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
import XLSXTransformStream from 'xlsx-write-stream';

// Input stream needs to implement Stream.Readable interface
// and each chunk should be an array of values (only string, date and number are supported value types)
inputStream
    .pipe(new XLSXTransformStream()) // This stream transforms the input into a xlsx format
    .pipe(fs.createWriteStream('file.xlsx')); // We need to store the result somewhere
```

## License

This package is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
