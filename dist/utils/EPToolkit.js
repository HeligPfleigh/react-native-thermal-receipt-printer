import { Buffer } from "buffer";
import * as iconv from "iconv-lite";
import BufferHelper from "./buffer-helper";
export function exchange_text(text, options) {
    options = options || {
        beep: false,
        cut: true,
        tailingLine: true,
        encoding: "UTF8",
    };
    var init_printer_bytes = new Buffer([27, 64]);
    var c_start_bytes = new Buffer([27, 97, 1]);
    var c_end_bytes = new Buffer([]); // [ 27, 97, 0 ];
    var reset_bytes = new Buffer([27, 97, 0, 29, 33, 0, 27, 50]);
    var m_start_bytes = new Buffer([27, 33, 16, 28, 33, 8]);
    var m_end_bytes = new Buffer([27, 33, 0, 28, 33, 0]);
    var b_start_bytes = new Buffer([27, 33, 48, 28, 33, 12]);
    var b_end_bytes = new Buffer([27, 33, 0, 28, 33, 0]);
    var cm_start_bytes = new Buffer([27, 97, 1, 27, 33, 16, 28, 33, 8]);
    var cm_end_bytes = new Buffer([27, 33, 0, 28, 33, 0]);
    var cb_start_bytes = new Buffer([27, 97, 1, 27, 33, 48, 28, 33, 12]);
    var cb_end_bytes = new Buffer([27, 33, 0, 28, 33, 0]);
    var cd_start_bytes = new Buffer([27, 97, 1, 27, 33, 32, 28, 33, 4]);
    var cd_end_bytes = new Buffer([27, 33, 0, 28, 33, 0]);
    var d_start_bytes = new Buffer([27, 33, 32, 28, 33, 4]);
    var d_end_bytes = new Buffer([27, 33, 0, 28, 33, 0]);
    var default_space_bytes = new Buffer([27, 50]);
    var cut_bytes = new Buffer([27, 105]);
    var beep_bytes = new Buffer([27, 66, 3, 2]);
    var bytes = new BufferHelper();
    bytes.concat(init_printer_bytes);
    bytes.concat(default_space_bytes);
    var temp = "";
    for (var i = 0; i < text.length; i++) {
        var ch = text[i];
        if (ch == "<") {
            bytes.concat(iconv.encode(temp, options.encoding));
            temp = "";
            if (text.substring(i, i + 3) == "<M>") {
                bytes.concat(m_start_bytes);
                i += 2;
            }
            else if (text.substring(i, i + 4) == "</M>") {
                bytes.concat(m_end_bytes);
                i += 3;
            }
            else if (text.substring(i, i + 3) == "<B>") {
                bytes.concat(b_start_bytes);
                i += 2;
            }
            else if (text.substring(i, i + 4) == "</B>") {
                bytes.concat(b_end_bytes);
                i += 3;
            }
            else if (text.substring(i, i + 3) == "<D>") {
                bytes.concat(d_start_bytes);
                i += 2;
            }
            else if (text.substring(i, i + 4) == "</D>") {
                bytes.concat(d_end_bytes);
                i += 3;
            }
            else if (text.substring(i, i + 3) == "<C>") {
                bytes.concat(c_start_bytes);
                i += 2;
            }
            else if (text.substring(i, i + 4) == "</C>") {
                bytes.concat(c_end_bytes);
                i += 3;
            }
            else if (text.substring(i, i + 4) == "<CM>") {
                bytes.concat(cm_start_bytes);
                i += 3;
            }
            else if (text.substring(i, i + 5) == "</CM>") {
                bytes.concat(cm_end_bytes);
                i += 4;
            }
            else if (text.substring(i, i + 4) == "<CD>") {
                bytes.concat(cd_start_bytes);
                i += 3;
            }
            else if (text.substring(i, i + 5) == "</CD>") {
                bytes.concat(cd_end_bytes);
                i += 4;
            }
            else if (text.substring(i, i + 4) == "<CB>") {
                bytes.concat(cb_start_bytes);
                i += 3;
            }
            else if (text.substring(i, i + 5) == "</CB>") {
                bytes.concat(cb_end_bytes);
                i += 4;
            }
        }
        else if (ch == "\n") {
            temp = temp + ch;
            bytes.concat(iconv.encode(temp, options.encoding));
            bytes.concat(reset_bytes);
            temp = "";
        }
        else {
            temp = temp + ch;
        }
    }
    if (temp.length > 0) {
        bytes.concat(iconv.encode(temp, options.encoding));
    }
    var line_bytes = new Buffer([10, 10, 10, 10, 10]);
    if (options.tailingLine) {
        bytes.concat(line_bytes);
    }
    if (options.cut) {
        bytes.concat(cut_bytes);
    }
    if (options.beep) {
        bytes.concat(beep_bytes);
    }
    return bytes.toBuffer();
}
