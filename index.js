
import { NativeModules } from 'react-native';

const { RNThermalReceiptPrinter, RNBLEPrinter } = NativeModules;

export const RNBLEPrinter = RNBLEPrinter;

export default RNThermalReceiptPrinter;
