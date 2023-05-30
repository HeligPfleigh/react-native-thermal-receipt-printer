import { NativeModules } from 'react-native';
import { IBLEPrinterIdentity } from '../models/ble-printer-identity';
import { BasePrinter } from './base-printer';

const RNBLEPrinter = NativeModules.RNBLEPrinter;

export class BLEPrinterWrapper extends BasePrinter<IBLEPrinterIdentity> {
  constructor() {
    super(RNBLEPrinter);
  }

  connectPrinter = (innerMacAddress: string): Promise<IBLEPrinterIdentity> =>
    new Promise((resolve, reject) =>
      this.module.connectPrinter(
        innerMacAddress,
        (printer: IBLEPrinterIdentity) => resolve(printer),
        (error: Error) => reject(error)
      )
    );
}
