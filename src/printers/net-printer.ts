import { NativeModules } from 'react-native';
import { INetPrinterIdentity } from '../models/net-printer-identity';
import { BasePrinter } from './base-printer';

export const RNNetPrinter = NativeModules.RNNetPrinter;

export class NetPrinterWrapper extends BasePrinter<INetPrinterIdentity> {
  constructor() {
    super(RNNetPrinter);
  }

  connectPrinter = (host: string, port: number): Promise<INetPrinterIdentity> =>
    new Promise((resolve, reject) =>
      this.module.connectPrinter(
        host,
        port,
        (printer: INetPrinterIdentity) => resolve(printer),
        (error: Error) => reject(error)
      )
    );
}
