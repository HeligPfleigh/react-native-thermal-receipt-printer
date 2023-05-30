import { Buffer } from 'buffer';
import * as iconv from 'iconv-lite';
var XMLParser = require('react-xml-parser');

import { BufferHelper } from './buffer-helper';
import { IPrintOptions } from '../models/print-options';

function b(c: string): number {
  return c.charCodeAt(0);
}

function buf(c: number[]): Buffer {
  return Buffer.from(c);
}

const ESC = 0x1B;
const FS = 0x1C;
const GS = 0x1D;
const NL = 0x0A;
const EXCLAMATION_MARK = 0x21; // '!'
const LETTER_E = 0x45; // 'E'
const LETTER_a = 0x61; // 'a'
const LETTER_M = 0x4D; // 'M'
const LETTER_Z = 0x5A; // 'Z'
const ESC_Init = [ESC, b('@')];
const PRINT_OPTIONS = {
  cut: [ESC, b('i')],
  beep: [ESC, b('B'), 0x03, 0x02],
  tailingLine: [NL, NL, NL, NL],
};
const defaultOptions: IPrintOptions = {
  beep: false,
  cut: false,
  tailingLine: false,
  encoding: 'UTF8',
  codepage: 0
};

export function processText(text: string, options?: IPrintOptions): Buffer {
  options = {
    ...defaultOptions,
    ...options
  };

  let bytes = new BufferHelper();

  let xml = new XMLParser().parseFromString(text);
  if (xml.name != 'Printout') {
    return bytes.toBuffer(); //root element has to be <Printout>
  }

  //set codepage first
  setCodepage(bytes, options);

  //iterate over XML and add the appriopiate elements
  xml.children.forEach((node: any) => {
    switch (node.name) {
      case 'Text':
        addText(node, bytes, options!);
        break;

      case 'NewLine':
        addNewLine(bytes, options!);
        break;

      case 'QRCode':
        addQRCode(node, bytes, options!);
        break;
    }
  });

  addPrintOptions(bytes, options);

  bytes.concat(buf(ESC_Init));

  return bytes.toBuffer();
}

function setCodepage(bytes: BufferHelper, options: IPrintOptions) {
  bytes.concat(buf([ESC, b('t')]));
  bytes.concat(Buffer.from([options.codepage]));

  if (options.codepage == 0)
    bytes.concat(buf([FS, b('&')]));
  else
    bytes.concat(buf([FS, b('.')]));
}

function addNewLine(bytes: BufferHelper, options: IPrintOptions) {
  bytes.concat(iconv.encode('\n', options.encoding!));
}

function addText(node: any, bytes: BufferHelper, options: IPrintOptions) {
  let font = 0; //0 - 1
  let align = 0; //left, center, right
  let fontWidth = 0; //1 - 4
  let fontHeight = 0; //1 - 4
  let bold = 0; //1 or 0
  let isBase64: boolean = false;

  const stringToTargetAlignment: any = { 'left': 0, 'center': 1, 'right': 2 };
  const intToTargetWidth = [0x00, 0x10, 0x20, 0x30];
  const intToTargetHeight = [0x00, 0x01, 0x02, 0x03];

  Object.keys(node.attributes).forEach((key) => {
    switch (key) {
      case 'font':
        font = parseInt(node.attributes['font']);
        break;

      case 'align':
        align = stringToTargetAlignment[node.attributes['align']];
        break;

      case 'fontWidth':
        fontWidth = parseInt(node.attributes['fontWidth']);
        fontWidth = intToTargetWidth[fontWidth];
        break;

      case 'fontHeight':
        fontHeight = parseInt(node.attributes['fontHeight']);
        fontHeight = intToTargetHeight[fontHeight];
        break;

      case 'bold':
        if (node.attributes['bold'] == '1') {
          bold = 1;
        }
        break;

      case 'base64':
        if (node.attributes['base64'] == '1') {
          isBase64 = true;
        }
        break;
    }
  });

  let text = node.value;
  if (isBase64) {
    text = Buffer.from(text, 'base64').toString('utf-8');
  }

  let controlBytes = [
    GS,
    EXCLAMATION_MARK,
    fontWidth + fontHeight,

    ESC,
    LETTER_E,
    bold,

    ESC,
    LETTER_a,
    align,

    ESC,
    LETTER_M,
    font,
  ];

  bytes.concat(buf(controlBytes));
  bytes.concat(iconv.encode(text, options.encoding!));
}

function addQRCode(node: any, bytes: BufferHelper, options: IPrintOptions) {
  let version = 0; //0 - 19
  let errorCorrectionLevel = 0; //0 - 3
  let magnification = 1; //1 - 8

  Object.keys(node.attributes).forEach((key) => {
    switch (key) {
      case 'version':
        version = parseInt(node.attributes['version']);
        break;

      case 'errorCorrectionLevel':
        errorCorrectionLevel = parseInt(node.attributes['errorCorrectionLevel']);
        break;

      case 'magnification':
        magnification = parseInt(node.attributes['magnification']);
        break;
    }
  });

  let codeData: string = node.value;

  let controlBytes = [
    ESC,
    LETTER_Z,
    version,
    errorCorrectionLevel,
    magnification,
    (codeData.length & 0xff),
    (codeData.length & 0xff00) >> 8
  ];

  bytes.concat(buf(controlBytes));
  bytes.concat(iconv.encode(codeData, options.encoding!));
}

function addPrintOptions(bytes: BufferHelper, options: IPrintOptions) {
  for (const key in options) {
    if (typeof options[key as keyof IPrintOptions] === 'boolean' && PRINT_OPTIONS[key as keyof typeof PRINT_OPTIONS]) {
      var controllerBytes = Buffer.from(PRINT_OPTIONS[key as keyof typeof PRINT_OPTIONS]);
      bytes.concat(controllerBytes);
    }
  }
}
