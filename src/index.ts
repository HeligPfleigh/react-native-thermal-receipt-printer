import { NativeEventEmitter } from 'react-native';

import { NetPrinterWrapper, RNNetPrinter } from './printers/net-printer';
import { USBPrinterWrapper } from './printers/usb-printer';
import { BLEPrinterWrapper } from './printers/ble-printer';

export const USBPrinter = new USBPrinterWrapper();
export const BLEPrinter = new BLEPrinterWrapper();
export const NetPrinter = new NetPrinterWrapper();
export const NetPrinterEventEmitter = new NativeEventEmitter(RNNetPrinter);

export * from './enums/thermal-printer-events.enum';
export * from './models/print-options';
export * from './models/ble-printer-identity';
export * from './models/net-printer-identity';
export * from './models/usb-printer-identity';
