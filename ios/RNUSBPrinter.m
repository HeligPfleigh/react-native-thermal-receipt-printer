//
//  RNUSBPrinter.m
//  RNThermalReceiptPrinter
//
//  Created by MTT on 06/12/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "RNUSBPrinter.h"
#import "PrinterSDK.h"

@implementation RNUSBPrinter

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}
RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(init
                  : (RCTResponseSenderBlock)successCallback fail
                  : (RCTResponseSenderBlock)errorCallback) {
  // TODO
  successCallback(@[ @"Init successful" ]);
}

RCT_EXPORT_METHOD(getDeviceList
                  : (RCTResponseSenderBlock)successCallback fail
                  : (RCTResponseSenderBlock)errorCallback) {
  // TODO
  NSMutableArray *printerArray = [NSMutableArray new];
  successCallback(@[ printerArray ]);
}

RCT_EXPORT_METHOD(connectPrinter
                  : (NSInteger)vendorId withProductID
                  : (NSInteger)productId success
                  : (RCTResponseSenderBlock)successCallback fail
                  : (RCTResponseSenderBlock)errorCallback) {
  // TODO
  errorCallback(@[ @"This function is not supported" ]);
}

RCT_EXPORT_METHOD(printRawData
                  : (NSString *)text printerOptions
                  : (NSDictionary *)options fail
                  : (RCTResponseSenderBlock)errorCallback) {
  // TODO
  errorCallback(@[ @"This function is not supported" ]);
}

RCT_EXPORT_METHOD(closeConn) {
  // TODO
}

@end
