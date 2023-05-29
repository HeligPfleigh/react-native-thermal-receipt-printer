import { NativeModules, NativeEventEmitter } from "react-native";

import { processText } from "./utils/printout-processor";

const RNUSBPrinter = NativeModules.RNUSBPrinter;
const RNBLEPrinter = NativeModules.RNBLEPrinter;
const RNNetPrinter = NativeModules.RNNetPrinter;

export interface PrinterOptions {
  beep?: boolean;
  cut?: boolean;
  tailingLine?: boolean;
  encoding?: string;
  codepage?: number;
}

export interface IUSBPrinter {
  deviceName: string;
  vendorId: string;
  productId: string;
}

export interface IBLEPrinter {
  deviceName: string;
  innerMacAddress: string;
}

export interface INetPrinter {
  deviceName: string;
  host: string;
  port: number;
}

const textTo64Buffer = (text: string, opts: PrinterOptions) => {
  const defaultOptions = {
    beep: false,
    cut: false,
    tailingLine: false,
    encoding: "UTF8",
    codepage: 0
  };

  const options = {
    ...defaultOptions,
    ...opts,
  };
  const buffer = processText(text, options);
  return buffer.toString("base64");
};

class Printer<T> {
  constructor(module: any) {
    this.init = this.promisifyVoid(module.init);
    this.getDeviceList = this.promisifyTArray(module.getDeviceList);
    this.closeConn = this.promisifyVoid(module.closeConn);
    this.print = (text: string, opts: PrinterOptions = {}) => {
      module.printRawData(textTo64Buffer(text, opts), (error: Error) => console.warn(error));
    }
  }

  init: () => Promise<void>;
  getDeviceList: () => Promise<T[]>;
  closeConn: () => Promise<void>;
  print: (text: string, opts?: PrinterOptions) => void;

  promisifyVoid = (fn: Function): () => Promise<void> => () =>
    new Promise((resolve, reject) =>
      fn((error: Error) => error ? reject(error) : resolve())
    );

  promisifyTArray = (fn: Function): () => Promise<T[]> => () =>
    new Promise((resolve, reject) =>
      fn((result: T[]) => resolve(result), (error: Error) => reject(error))
    );
}

class USBPrinterWrapper extends Printer<IUSBPrinter> {
  constructor(private module: any) {
    super(module);
  }

  connectPrinter = (vendorId: string, productId: string): Promise<IUSBPrinter> =>
    new Promise((resolve, reject) =>
      this.module.connectPrinter(
        vendorId,
        productId,
        (printer: IUSBPrinter) => resolve(printer),
        (error: Error) => reject(error)
      )
    );
}

class BLEPrinterWrapper extends Printer<IBLEPrinter> {
  constructor(private module: any) {
    super(module);
  }

  connectPrinter = (innerMacAddress: string): Promise<IBLEPrinter> =>
    new Promise((resolve, reject) =>
      this.module.connectPrinter(
        innerMacAddress,
        (printer: IBLEPrinter) => resolve(printer),
        (error: Error) => reject(error)
      )
    );
}

class NetPrinterWrapper extends Printer<INetPrinter> {
  constructor(private module: any) {
    super(module);
  }

  connectPrinter = (host: string, port: number): Promise<INetPrinter> =>
    new Promise((resolve, reject) =>
      this.module.connectPrinter(
        host,
        port,
        (printer: INetPrinter) => resolve(printer),
        (error: Error) => reject(error)
      )
    );
}

export const USBPrinter = new USBPrinterWrapper(RNUSBPrinter);
export const BLEPrinter = new BLEPrinterWrapper(RNBLEPrinter);
export const NetPrinter = new NetPrinterWrapper(RNNetPrinter);
export const NetPrinterEventEmitter = new NativeEventEmitter(RNNetPrinter);

export enum RN_THERMAL_RECEIPT_PRINTER_EVENTS {
  EVENT_NET_PRINTER_SCANNED_SUCCESS = "scannerResolved",
  EVENT_NET_PRINTER_SCANNING = "scannerRunning",
  EVENT_NET_PRINTER_SCANNED_ERROR = "registerError",
}