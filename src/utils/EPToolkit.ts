import { Buffer } from "buffer";
import * as iconv from "iconv-lite";
import BufferHelper from "./buffer-helper";

export function exchange_text(text: any, options: any) {
  options = options || {
    beep: false,
    cut: true,
    tailingLine: true,
    encoding: "UTF8",
  };

  let init_printer_bytes = new Buffer([27, 64]);
  let c_start_bytes = new Buffer([27, 97, 1]);
  let c_end_bytes = new Buffer([]); // [ 27, 97, 0 ];
  let reset_bytes = new Buffer([27, 97, 0, 29, 33, 0, 27, 50]);
  let m_start_bytes = new Buffer([27, 33, 16, 28, 33, 8]);
  let m_end_bytes = new Buffer([27, 33, 0, 28, 33, 0]);
  let b_start_bytes = new Buffer([27, 33, 48, 28, 33, 12]);
  let b_end_bytes = new Buffer([27, 33, 0, 28, 33, 0]);
  let cm_start_bytes = new Buffer([27, 97, 1, 27, 33, 16, 28, 33, 8]);
  let cm_end_bytes = new Buffer([27, 33, 0, 28, 33, 0]);
  let cb_start_bytes = new Buffer([27, 97, 1, 27, 33, 48, 28, 33, 12]);
  let cb_end_bytes = new Buffer([27, 33, 0, 28, 33, 0]);
  let cd_start_bytes = new Buffer([27, 97, 1, 27, 33, 32, 28, 33, 4]);
  let cd_end_bytes = new Buffer([27, 33, 0, 28, 33, 0]);
  let d_start_bytes = new Buffer([27, 33, 32, 28, 33, 4]);
  let d_end_bytes = new Buffer([27, 33, 0, 28, 33, 0]);

  let default_space_bytes = new Buffer([27, 50]);
  let cut_bytes = new Buffer([27, 105]);
  let beep_bytes = new Buffer([27, 66, 3, 2]);

  let bytes = new BufferHelper();
  bytes.concat(init_printer_bytes);
  bytes.concat(default_space_bytes);
  let temp = "";
  for (let i = 0; i < text.length; i++) {
    let ch = text[i];
    if (ch == "<") {
      bytes.concat(iconv.encode(temp, options.encoding));
      temp = "";
      if (text.substring(i, i + 3) == "<M>") {
        bytes.concat(m_start_bytes);
        i += 2;
      } else if (text.substring(i, i + 4) == "</M>") {
        bytes.concat(m_end_bytes);
        i += 3;
      } else if (text.substring(i, i + 3) == "<B>") {
        bytes.concat(b_start_bytes);
        i += 2;
      } else if (text.substring(i, i + 4) == "</B>") {
        bytes.concat(b_end_bytes);
        i += 3;
      } else if (text.substring(i, i + 3) == "<D>") {
        bytes.concat(d_start_bytes);
        i += 2;
      } else if (text.substring(i, i + 4) == "</D>") {
        bytes.concat(d_end_bytes);
        i += 3;
      } else if (text.substring(i, i + 3) == "<C>") {
        bytes.concat(c_start_bytes);
        i += 2;
      } else if (text.substring(i, i + 4) == "</C>") {
        bytes.concat(c_end_bytes);
        i += 3;
      } else if (text.substring(i, i + 4) == "<CM>") {
        bytes.concat(cm_start_bytes);
        i += 3;
      } else if (text.substring(i, i + 5) == "</CM>") {
        bytes.concat(cm_end_bytes);
        i += 4;
      } else if (text.substring(i, i + 4) == "<CD>") {
        bytes.concat(cd_start_bytes);
        i += 3;
      } else if (text.substring(i, i + 5) == "</CD>") {
        bytes.concat(cd_end_bytes);
        i += 4;
      } else if (text.substring(i, i + 4) == "<CB>") {
        bytes.concat(cb_start_bytes);
        i += 3;
      } else if (text.substring(i, i + 5) == "</CB>") {
        bytes.concat(cb_end_bytes);
        i += 4;
      }
    } else if (ch == "\n") {
      temp = temp + ch;
      bytes.concat(iconv.encode(temp, options.encoding));
      bytes.concat(reset_bytes);
      temp = "";
    } else {
      temp = temp + ch;
    }
  }
  if (temp.length > 0) {
    bytes.concat(iconv.encode(temp, options.encoding));
  }
  let line_bytes = new Buffer([10, 10, 10, 10, 10]);
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
