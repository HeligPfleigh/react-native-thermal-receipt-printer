//
//  RNNetPrinter.m
//  RNThermalReceiptPrinter
//
//  Created by MTT on 06/11/19.
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
    connected_ip = nil;
    resolve(@"Init successful");
}

RCT_REMAP_METHOD(getDeviceList,
                 get_device_list_resolver:(RCTPromiseResolveBlock)resolve
                 get_device_list_rejecter:(RCTPromiseRejectBlock)reject) {
    // TODO
    NSMutableArray *printerArray = [NSMutableArray new];
    resolve(@[printerArray]);
}

RCT_EXPORT_METHOD(connectPrinter:(NSString *)host withPort:(NSInteger)port                               connect_printer_resolver:(RCTPromiseResolveBlock)resolve
                  connect_printer_rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        BOOL isConnectSuccess = [[PrinterSDK defaultPrinterSDK] connectIP:host];
        !isConnectSuccess ? [NSException raise:@"Invalid connection" format:@"Can't connect to printer %@", host] : nil;

        connected_ip = host;
        resolve([NSString stringWithFormat:@"Connected to printer %@", host]);

    } @catch (NSException *exception) {
        reject(nil, exception.reason, nil);
    }
}

RCT_EXPORT_METHOD(printText:(NSString *)text printerOptions:(NSDictionary *)options
                  print_data_resolver:(RCTPromiseResolveBlock)resolve
                  print_data_rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        NSNumber* fontSizePtr = [options valueForKey:@"fontSize"];
        NSNumber* beepPtr = [options valueForKey:@"beep"];
        NSNumber* cutPtr = [options valueForKey:@"cut"];
        
        NSInteger fontSize = [fontSizePtr intValue] || 1;
        BOOL beep = (BOOL)[beepPtr intValue];
        BOOL cut = (BOOL)[cutPtr intValue];
        
        !connected_ip ? [NSException raise:@"Invalid connection" format:@"Can't connect to printer"] : nil;
        
        [[PrinterSDK defaultPrinterSDK] setFontSizeMultiple:(fontSize)];
        // [[PrinterSDK defaultPrinterSDK] printTestPaper];
        [[PrinterSDK defaultPrinterSDK] printText:text];
        beep ? [[PrinterSDK defaultPrinterSDK] beep] : nil;
        cut ? [[PrinterSDK defaultPrinterSDK] cutPaper] : nil;
        
        resolve(@"Print successful!!!");
    } @catch (NSException *exception) {
        reject(nil, exception.reason, nil);
    }
}

RCT_REMAP_METHOD(closeConn,
                 close_connect_resolver:(RCTPromiseResolveBlock)resolve
                 close_connect_rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        !connected_ip ? [NSException raise:@"Invalid connection" format:@"Can't connect to printer"] : nil;
        [[PrinterSDK defaultPrinterSDK] disconnect];
        connected_ip = nil;
        resolve(@"Successful disconnect");
    } @catch (NSException *exception) {
        reject(nil, exception.reason, nil);
    }
}

@end

