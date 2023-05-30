import { IPrintOptions } from "../models/print-options";
import { processText } from "../utils/printout-processor";

const textToBufferBase64 = (text: string, opts: IPrintOptions) => {
  const buffer = processText(text, opts);
  return buffer.toString('base64');
};

export class BasePrinter<T> {
  constructor(protected module: any) {
    this.init = this.promisifyVoid(module.init);
    this.getDeviceList = this.promisifyTArray(module.getDeviceList);
    this.closeConn = this.promisifyVoid(module.closeConn);
    this.print = (text: string, opts: IPrintOptions = {}) => {
      module.printRawData(textToBufferBase64(text, opts), (error: Error) => console.warn(error));
    }
  }

  init: () => Promise<void>;
  getDeviceList: () => Promise<T[]>;
  closeConn: () => Promise<void>;
  print: (text: string, opts?: IPrintOptions) => void;

  promisifyVoid = (fn: Function): () => Promise<void> => () =>
    new Promise((resolve, reject) =>
      fn((error: Error) => error ? reject(error) : resolve())
    );

  promisifyTArray = (fn: Function): () => Promise<T[]> => () =>
    new Promise((resolve, reject) =>
      fn((result: T[]) => resolve(result), (error: Error) => reject(error))
    );
}
