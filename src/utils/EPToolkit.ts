import { Buffer } from "buffer";
import * as iconv from "iconv-lite";
var XMLParser = require("react-xml-parser");
import { BufferHelper } from "./buffer-helper";

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

const ESC_Init = [ESC, b("@")];

const PRINT_OPTIONS = {
  cut: [ESC, b("i")],
  beep: [ESC, b("B"), 0x03, 0x02],
  tailingLine: [NL, NL, NL, NL],
};

type IOptions = {
  beep: boolean;
  cut: boolean;
  tailingLine: boolean;
  encoding: string;
  codepage: number
};

const default_options: IOptions = {
  beep: false,
  cut: true,
  tailingLine: true,
  encoding: "UTF8",
  codepage: 0
};

export function exchange_text(text: string, options: IOptions): Buffer {
  const adjustedOptions = options || default_options;

  let bytes = new BufferHelper();

  let xml = new XMLParser().parseFromString(text);
  if (xml.name != "Printout") {
    return bytes.toBuffer(); //root element has to be <Printout>
  }

  //set codepage first
  setCodepage(bytes, options);

  //iterate over XML and add the appriopiate elements
  xml.children.forEach((node: any) => {
    switch (node.name) {
      case "Text":
        addText(node, bytes, adjustedOptions);
        break;

      case "NewLine":
        addNewLine(bytes, adjustedOptions);
        break;

      case "QRCode":
        addQRCode(node, bytes, adjustedOptions);
        break;
    }
  });

  addPrintOptions(bytes, adjustedOptions);

  bytes.concat(buf(ESC_Init));

  return bytes.toBuffer();
}

function setCodepage(bytes: BufferHelper, options: IOptions) {
  bytes.concat(buf([ESC, b("t")]));
  bytes.concat(Buffer.from([options.codepage]));

  if (options.codepage == 0)
    bytes.concat(buf([FS, b("&")]));
  else
    bytes.concat(buf([FS, b(".")]));
}

function addNewLine(bytes: BufferHelper, options: IOptions) {
  bytes.concat(iconv.encode("\n", options.encoding));
}

function addText(node: any, bytes: BufferHelper, options: IOptions) {
  let font = 0; //0 - 1
  let align = 0; //left, center, right
  let fontWidth = 0; //1 - 4
  let fontHeight = 0; //1 - 4
  let bold = 0; //1 or 0
  let isBase64: boolean = false;

  const stringToTargetAlignment = { "left": 0, "center": 1, "right": 2 };
  const intToTargetWidth = [0x00, 0x10, 0x20, 0x30];
  const intToTargetHeight = [0x00, 0x01, 0x02, 0x03];

  Object.keys(node.attributes).forEach((key) => {
    switch (key) {
      case "font":
        font = parseInt(node.attributes["font"]);
        break;

      case "align":
        align = stringToTargetAlignment[node.attributes["align"]];
        break;

      case "fontWidth":
        fontWidth = parseInt(node.attributes["fontWidth"]);
        fontWidth = intToTargetWidth[fontWidth];
        break;

      case "fontHeight":
        fontHeight = parseInt(node.attributes["fontHeight"]);
        fontHeight = intToTargetHeight[fontHeight];
        break;

      case "bold":
        if (node.attributes["bold"] == "1") {
          bold = 1;
        }
        break;

      case "base64":
        if (node.attributes["base64"] == "1") {
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
    0x21, //"!"
    fontWidth + fontHeight,

    ESC,
    0x45, //"E"
    bold,

    ESC,
    0x61, //"a"
    align,

    ESC,
    0x4D, //"M"
    font,
  ];

  bytes.concat(buf(controlBytes));
  bytes.concat(iconv.encode(text, options.encoding));
}

function addQRCode(node: any, bytes: BufferHelper, options: IOptions) {
  let version = 0; //0 - 19
  let errorCorrectionLevel = 0; //0 - 3
  let magnification = 1; //1 - 8

  Object.keys(node.attributes).forEach((key) => {
    switch (key) {
      case "version":
        version = parseInt(node.attributes["version"]);
        break;

      case "errorCorrectionLevel":
        errorCorrectionLevel = parseInt(node.attributes["errorCorrectionLevel"]);
        break;

      case "magnification":
        magnification = parseInt(node.attributes["magnification"]);
        break;
    }
  });

  let codeData: string = node.value;

  let controlBytes = [
    ESC,
    0x5A, //"Z"
    version,
    errorCorrectionLevel,
    magnification,
    (codeData.length & 0xff),
    (codeData.length & 0xff00) >> 8
  ];

  bytes.concat(buf(controlBytes));
  bytes.concat(iconv.encode(codeData, options.encoding));
}

function addPrintOptions(bytes: BufferHelper, options: IOptions) {
  for (const key in options) {
    if (typeof options[key] === "boolean" && PRINT_OPTIONS[key]) {
      var controllerBytes = Buffer.from(PRINT_OPTIONS[key]);
      bytes.concat(controllerBytes);
    }
  }
}