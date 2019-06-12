//
//  RNUSBPrinter.m
//  RNThermalReceiptPrinter
//
//  Created by MTT on 06/12/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "RNNetPrinter.h"
#import "PrinterSDK.h"

@implementation RNNetPrinter

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}
RCT_EXPORT_MODULE()

RCT_REMAP_METHOD(init,
                 init_resolver:(RCTPromiseResolveBlock)resolve
                 init_rejecter:(RCTPromiseRejectBlock)reject) {
    // TODO
    resolve(@"Init successful");
}

RCT_REMAP_METHOD(getDeviceList,
                 get_device_list_resolver:(RCTPromiseResolveBlock)resolve
                 get_device_list_rejecter:(RCTPromiseRejectBlock)reject) {
    // TODO
    NSMutableArray printerArray = [NSMutableArray new];
    resolve(@[printerArray]);
}

RCT_EXPORT_METHOD(connectPrinter:(NSInteger)vendorId withProductID:(NSInteger)productId                               connect_printer_resolver:(RCTPromiseResolveBlock)resolve
                  connect_printer_rejecter:(RCTPromiseRejectBlock)reject) {
    // TODO
    resolve(@"Connect successful");
}

RCT_EXPORT_METHOD(printText:(NSString *)text printerOptions:(NSDictionary *)options
                  print_data_resolver:(RCTPromiseResolveBlock)resolve
                  print_data_rejecter:(RCTPromiseRejectBlock)reject) {
    // TODO
    resolve(@"Print successful");
}

RCT_REMAP_METHOD(closeConn,
                 close_connect_resolver:(RCTPromiseResolveBlock)resolve
                 close_connect_rejecter:(RCTPromiseRejectBlock)reject) {
    // TODO
    resolve(@"Successful disconnect");
}

@end

