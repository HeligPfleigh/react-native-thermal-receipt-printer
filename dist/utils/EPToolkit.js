import { Buffer } from "buffer";
import * as iconv from "iconv-lite";
// import * as Jimp from "jimp";
import BufferHelper from "./buffer-helper";
var init_printer_bytes = Buffer.from([27, 64]);
var l_start_bytes = Buffer.from([27, 97, 0]);
var l_end_bytes = Buffer.from([]);
var c_start_bytes = Buffer.from([27, 97, 1]);
var c_end_bytes = Buffer.from([]); // [ 27, 97, 0 ];
var r_start_bytes = Buffer.from([27, 97, 2]);
var r_end_bytes = Buffer.from([]);
var default_space_bytes = Buffer.from([27, 50]);
var reset_bytes = Buffer.from([27, 97, 0, 29, 33, 0, 27, 50]);
var m_start_bytes = Buffer.from([27, 33, 16, 28, 33, 8]);
var m_end_bytes = Buffer.from([27, 33, 0, 28, 33, 0]);
var b_start_bytes = Buffer.from([27, 33, 48, 28, 33, 12]);
var b_end_bytes = Buffer.from([27, 33, 0, 28, 33, 0]);
var cm_start_bytes = Buffer.from([27, 97, 1, 27, 33, 16, 28, 33, 8]);
var cm_end_bytes = Buffer.from([27, 33, 0, 28, 33, 0]);
var cb_start_bytes = Buffer.from([27, 97, 1, 27, 33, 48, 28, 33, 12]);
var cb_end_bytes = Buffer.from([27, 33, 0, 28, 33, 0]);
var cd_start_bytes = Buffer.from([27, 97, 1, 27, 33, 32, 28, 33, 4]);
var cd_end_bytes = Buffer.from([27, 33, 0, 28, 33, 0]);
var d_start_bytes = Buffer.from([27, 33, 32, 28, 33, 4]);
var d_end_bytes = Buffer.from([27, 33, 0, 28, 33, 0]);
var cut_bytes = Buffer.from([27, 105]);
var beep_bytes = Buffer.from([27, 66, 3, 2]);
var line_bytes = Buffer.from([10, 10, 10, 10, 10]);
var options_controller = {
    cut: cut_bytes,
    beep: beep_bytes,
    tailingLine: line_bytes,
};
var controller = {
    "<M>": m_start_bytes,
    "</M>": m_end_bytes,
    "<B>": b_start_bytes,
    "</B>": b_end_bytes,
    "<D>": d_start_bytes,
    "</D>": d_end_bytes,
    "<C>": c_start_bytes,
    "</C>": c_end_bytes,
    "<CM>": cm_start_bytes,
    "</CM>": cm_end_bytes,
    "<CD>": cd_start_bytes,
    "</CD>": cd_end_bytes,
    "<CB>": cb_start_bytes,
    "</CB>": cb_end_bytes,
    "<L>": l_start_bytes,
    "</L>": l_end_bytes,
    "<R>": r_start_bytes,
    "</R>": r_end_bytes,
};
var default_options = {
    beep: false,
    cut: true,
    tailingLine: true,
    encoding: "UTF8",
};
export function exchange_text(text, options) {
    var m_options = options || default_options;
    var bytes = new BufferHelper();
    bytes.concat(init_printer_bytes);
    bytes.concat(default_space_bytes);
    var temp = "";
    for (var i = 0; i < text.length; i++) {
        var ch = text[i];
        switch (ch) {
            case "<":
                bytes.concat(iconv.encode(temp, m_options.encoding));
                temp = "";
                // add bytes for changing font and justifying text
                for (var tag in controller) {
                    if (text.substring(i, i + tag.length) === tag) {
                        bytes.concat(controller[tag]);
                        i += tag.length - 1;
                    }
                }
                break;
            case "\n":
                temp = "" + temp + ch;
                bytes.concat(iconv.encode(temp, m_options.encoding));
                bytes.concat(reset_bytes);
                temp = "";
                break;
            default:
                temp = "" + temp + ch;
                break;
        }
    }
    temp.length && bytes.concat(iconv.encode(temp, m_options.encoding));

    // check for "encoding" flag
    if (typeof m_options["encoding"] === "boolean" && options_controller["encoding"]) {
        bytes.concat(options_controller["encoding"]);
    }

    // check for "tailingLine" flag
    if (typeof m_options["tailingLine"] === "boolean" && options_controller["tailingLine"]) {
        bytes.concat(options_controller["tailingLine"]);
    }

    // check for "cut" flag
    if (typeof m_options["cut"] === "boolean" && options_controller["cut"]) {
        bytes.concat(options_controller["cut"]);
    }

    // check for "beep" flag
    if (typeof m_options["beep"] === "boolean" && options_controller["beep"]) {
        bytes.concat(options_controller["beep"]);
    }

    return bytes.toBuffer();
}
// export async function exchange_image(
//   imagePath: string,
//   threshold: number
// ): Promise<Buffer> {
//   let bytes = new BufferHelper();
//   try {
//     // need to find other solution cause jimp is not working in RN
//     const raw_image = await Jimp.read(imagePath);
//     const img = raw_image.resize(250, 250).quality(60).greyscale();
//     let hex;
//     const nl = img.bitmap.width % 256;
//     const nh = Math.round(img.bitmap.width / 256);
//     // data
//     const data = Buffer.from([0, 0, 0]);
//     const line = Buffer.from([10]);
//     for (let i = 0; i < Math.round(img.bitmap.height / 24) + 1; i++) {
//       // ESC * m nL nH bitmap
//       let header = Buffer.from([27, 42, 33, nl, nh]);
//       bytes.concat(header);
//       for (let j = 0; j < img.bitmap.width; j++) {
//         data[0] = data[1] = data[2] = 0; // Clear to Zero.
//         for (let k = 0; k < 24; k++) {
//           if (i * 24 + k < img.bitmap.height) {
//             // if within the BMP size
//             hex = img.getPixelColor(j, i * 24 + k);
//             if (Jimp.intToRGBA(hex).r <= threshold) {
//               data[Math.round(k / 8)] += 128 >> k % 8;
//             }
//           }
//         }
//         const dit = Buffer.from([data[0], data[1], data[2]]);
//         bytes.concat(dit);
//       }
//       bytes.concat(line);
//     } // data
//   } catch (error) {
//     console.log(error);
//   }
//   return bytes.toBuffer();
// }
