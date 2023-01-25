import { Buffer } from "buffer";
import * as iconv from "iconv-lite";
var XMLParser = require("react-xml-parser");
import BufferHelper from "./buffer-helper";
function b(c) {
    return c.charCodeAt(0);
}
function buf(c) {
    return Buffer.from(c);
}
var ESC = 0x1B;
var FS = 0x1C;
var GS = 0x1D;
var NL = 0x0A;
var ESC_Init = [ESC, b("@")];
var PRINT_OPTIONS = {
    cut: [ESC, b("i")],
    beep: [ESC, b("B"), 0x03, 0x02],
    tailingLine: [NL, NL, NL, NL],
};
var default_options = {
    beep: false,
    cut: true,
    tailingLine: true,
    encoding: "UTF8",
    codepage: 0
};
export function exchange_text(text, options) {
    var adjustedOptions = options || default_options;
    var bytes = new BufferHelper();
    var xml = new XMLParser().parseFromString(text);
    if (xml.name != "Printout") {
        return bytes.toBuffer(); //root element has to be <Printout>
    }
    //set codepage first
    setCodepage(bytes, options);
    //iterate over XML and add the appriopiate elements
    xml.children.forEach(function (node) {
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
function setCodepage(bytes, options) {
    bytes.concat(buf([ESC, b("t")]));
    bytes.concat(Buffer.from([options.codepage]));
    if (options.codepage == 0)
        bytes.concat(buf([FS, b("&")]));
    else
        bytes.concat(buf([FS, b(".")]));
}
function addNewLine(bytes, options) {
    bytes.concat(iconv.encode("\n", options.encoding));
}
function addText(node, bytes, options) {
    var font = 0; //0 - 1
    var align = 0; //left, center, right
    var fontWidth = 0; //1 - 4
    var fontHeight = 0; //1 - 4
    var bold = 0; //1 or 0
    var isBase64 = false;
    var stringToTargetAlignment = { "left": 0, "center": 1, "right": 2 };
    var intToTargetWidth = [0x00, 0x10, 0x20, 0x30];
    var intToTargetHeight = [0x00, 0x01, 0x02, 0x03];
    Object.keys(node.attributes).forEach(function (key) {
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
    var text = node.value;
    if (isBase64) {
        text = Buffer.from(text, 'base64').toString('utf-8');
    }
    var controlBytes = [
        GS,
        0x21,
        fontWidth + fontHeight,
        ESC,
        0x45,
        bold,
        ESC,
        0x61,
        align,
        ESC,
        0x4D,
        font,
    ];
    bytes.concat(buf(controlBytes));
    bytes.concat(iconv.encode(text, options.encoding));
}
function addQRCode(node, bytes, options) {
    var version = 0; //0 - 19
    var errorCorrectionLevel = 0; //0 - 3
    var magnification = 1; //1 - 8
    Object.keys(node.attributes).forEach(function (key) {
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
    var codeData = node.value;
    var controlBytes = [
        ESC,
        0x5A,
        version,
        errorCorrectionLevel,
        magnification,
        (codeData.length & 0xff),
        (codeData.length & 0xff00) >> 8
    ];
    bytes.concat(buf(controlBytes));
    bytes.concat(iconv.encode(codeData, options.encoding));
}
function addPrintOptions(bytes, options) {
    for (var key in options) {
        if (typeof options[key] === "boolean" && PRINT_OPTIONS[key]) {
            var controllerBytes = Buffer.from(PRINT_OPTIONS[key]);
            bytes.concat(controllerBytes);
        }
    }
}
