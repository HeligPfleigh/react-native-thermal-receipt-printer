import React, { NativeModules, NativeEventEmitter, Platform } from "react-native";

import EPToolkit from "escpos-printer-toolkit";

var RNUSBPrinter = NativeModules.RNUSBPrinter;
var RNBLEPrinter = NativeModules.RNBLEPrinter;
var RNNetPrinter = NativeModules.RNNetPrinter;

var textTo64Buffer = (text, opts) => {
  let options = {
    beep: false,
    cut: false,
    tailingLine: false,
    encoding: "UTF8",
    ...opts
  };
  const buffer = EPToolkit.exchange_text(text, options);
  return buffer.toString("base64");
};

var billTo64Buffer = (text, opts) => {
  let options = {
    beep: true,
    cut: true,
    encoding: "UTF8",
    tailingLine: true,
    ...opts
  };
  const buffer = EPToolkit.exchange_text(text, options);
  return buffer.toString("base64");
};

const textPreprocessingIOS = (text) => {
  let options = {
    beep: true,
    cut: true,
  };
  return {
    text: text.replace(/<\/?CB>/g,'').replace(/<\/?C>/g,'').replace(/<\/?B>/g,''),
    opts: options
  }
}

export const USBPrinter = {
  init: () =>
    new Promise((resolve, reject) =>
      RNUSBPrinter.init(() => resolve(), error => reject(error))
    ),

  getDeviceList: () =>
    new Promise((resolve, reject) =>
      RNUSBPrinter.getDeviceList(
        printers => resolve(printers),
        error => reject(error)
      )
    ),

  connectPrinter: (vendorId, productId) =>
    new Promise((resolve, reject) =>
      RNUSBPrinter.connectPrinter(
        vendorId,
        productId,
        printer => resolve(printer),
        error => reject(error)
      )
    ),

  closeConn: () =>
    new Promise((resolve, reject) => {
      RNUSBPrinter.closeConn();
      resolve();
    }),

  printText: (text, opts = {}) =>
    RNUSBPrinter.printRawData(textTo64Buffer(text, opts), error =>
      console.warn(error)
    ),

  printBill: (text, opts = {}) =>
    RNUSBPrinter.printRawData(billTo64Buffer(text, opts), error =>
      console.warn(error)
    )
};

export const BLEPrinter = {
  init: () =>
    new Promise((resolve, reject) =>
      RNBLEPrinter.init(() => resolve(), error => reject(error))
    ),

  getDeviceList: () =>
    new Promise((resolve, reject) =>
      RNBLEPrinter.getDeviceList(
        printers => resolve(printers),
        error => reject(error)
      )
    ),

  connectPrinter: inner_mac_address =>
    new Promise((resolve, reject) =>
      RNBLEPrinter.connectPrinter(
        inner_mac_address,
        printer => resolve(printer),
        error => reject(error)
      )
    ),

  closeConn: () =>
    new Promise((resolve, reject) => {
      RNBLEPrinter.closeConn();
      resolve();
    }),

  printText: (text, opts = {}) =>
    RNBLEPrinter.printRawData(textTo64Buffer(text, opts), error =>
      console.warn(error)
    ),

  printBill: (text, opts = {}) => {
    if (Platform.OS === 'ios') {
      const processedText = textPreprocessingIOS(text)
      RNBLEPrinter.printRawData(processedText.text, processedText.opts, error => console.warn(error))
    } else {
      RNBLEPrinter.printRawData(billTo64Buffer(text, opts), error =>
        console.warn(error)
      )
    }
  }
};

export const NetPrinter = {
  init: () =>
    new Promise((resolve, reject) =>
      RNNetPrinter.init(() => resolve(), error => reject(error))
    ),

  getDeviceList: () =>
    new Promise((resolve, reject) =>
      RNNetPrinter.getDeviceList(
        printers => resolve(printers),
        error => reject(error)
      )
  ),

  connectPrinter: (host, port) =>
    new Promise((resolve, reject) =>
      RNNetPrinter.connectPrinter(
        host,
        port,
        printer => resolve(printer),
        error => reject(error)
      )
    ),

  closeConn: () =>
    new Promise((resolve, reject) => {
      RNNetPrinter.closeConn();
      resolve();
    }),

  printText: (text, opts = {}) =>
    RNNetPrinter.printRawData(textTo64Buffer(text, opts), error =>
      console.warn(error)
    ),

  printBill: (text, opts = {}) => {
    if (Platform.OS === 'ios') {
      const processedText = textPreprocessingIOS(text)
      RNNetPrinter.printRawData(processedText.text, processedText.opts, error => console.warn(error))
    } else {
      RNNetPrinter.printRawData(billTo64Buffer(text, opts), error =>
        console.warn(error)
      )
    }
  }
};

export const NetPrinterEventEmitter = new NativeEventEmitter(RNNetPrinter);
