import { IPrintOptions } from "../models/print-options";
import { processText } from "../utils/printout-processor";

const textToBufferBase64 = (text: string, opts?: IPrintOptions) => {
  const buffer = processText(text, opts);
  return buffer.toString('base64');
};

export class BasePrinter<T> {
  constructor(protected module: any) { }

  init(): Promise<void> {
    return new Promise((resolve, reject) =>
      this.module.init(() => resolve(), (error: Error) => reject(error))
    );
  }

  getDeviceList(): Promise<T[]> {
    return new Promise((resolve, reject) =>
      this.module.getDeviceList((printers: T[]) => resolve(printers), (error: Error) => reject(error))
    );
  }

  closeConn(): Promise<void> {
    return new Promise((resolve) => {
      this.module.closeConn();
      resolve();
    });
  }

  print(text: string, opts?: IPrintOptions): void {
    this.module.printRawData(textToBufferBase64(text, opts), (error: Error) =>
      console.warn(error)
    );
  }
}
