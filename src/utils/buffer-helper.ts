import { Buffer } from "buffer";

export class BufferHelper {
  buffers: Buffer[];
  size: number;

  constructor() {
    this.buffers = [];
    this.size = 0;
  }

  get length() {
    return this.size;
  }

  load(stream: any, callback: any) {
    stream.on("data", (trunk: Buffer) => {
      this.concat(trunk);
    });
    stream.on("end", () => {
      callback(null, this.toBuffer());
    });
    stream.once("error", callback);
  };

  concat(buffer: Buffer): BufferHelper {
    this.buffers.push(buffer);
    this.size += buffer.length;
    return this;
  };

  empty(): BufferHelper {
    this.buffers = [];
    this.size = 0;
    return this;
  };

  toBuffer(): Buffer {
    return Buffer.concat(this.buffers, this.size);
  }

  toString(encoding: BufferEncoding): string {
    return this.toBuffer().toString(encoding);
  }
}
