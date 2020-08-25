/// <reference types="node" />
import { Buffer } from "buffer";
export default class BufferHelper {
    buffers: Buffer[];
    size: number;
    constructor();
    get length(): number;
    concat: (buffer: Buffer) => BufferHelper;
    empty: () => BufferHelper;
    toBuffer: () => Buffer;
    toString: (encoding: BufferEncoding) => string;
    load: (stream: any, callback: any) => void;
}
