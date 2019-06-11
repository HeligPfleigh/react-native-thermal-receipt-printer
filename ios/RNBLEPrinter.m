//
//  RNBLEPrinter.m
//
//  Created by MTT on 06/10/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

#import "RNBLEPrinter.h"
#import "PrinterSDK.h"

@implementation RNBLEPrinter

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

RCT_EXPORT_MODULE()

RCT_REMAP_METHOD(init,
                 init_resolver:(RCTPromiseResolveBlock)resolve
                 init_rejecter:(RCTPromiseRejectBlock)reject) {
    _printerArray = [NSMutableArray new];
    m_printer = [[NSObject alloc] init];
    // tricky one, should be replaced later API MISUSE: <CBCentralManager> can only accept this command while in the powered on state
    [[PrinterSDK defaultPrinterSDK] scanPrintersWithCompletion:^(Printer* printer){}];
    resolve(@"Init successful");
}

RCT_REMAP_METHOD(getDeviceList,
                 get_device_list_resolver:(RCTPromiseResolveBlock)resolve
                 get_device_list_rejecter:(RCTPromiseRejectBlock)reject) {
    if (!_printerArray) {
        NSError *error = nil;
        reject(nil, @"Must call init function first", error);
    } else {
        [[PrinterSDK defaultPrinterSDK] scanPrintersWithCompletion:^(Printer* printer){
            [_printerArray addObject:printer];
            NSMutableArray *mapped = [NSMutableArray arrayWithCapacity:[_printerArray count]];
            [_printerArray enumerateObjectsUsingBlock:^(id obj, NSUInteger idx, BOOL *stop) {
                NSDictionary *dict = @{ @"device_name" : printer.name, @"inner_mac_address" : printer.UUIDString};
                [mapped addObject:dict];
            }];
            resolve(@[mapped]);
        }];
    }
}

RCT_EXPORT_METHOD(connectPrinter:(NSString *)inner_mac_address
                 connect_printer_resolver:(RCTPromiseResolveBlock)resolve
                 connect_printer_rejecter:(RCTPromiseRejectBlock)reject) {
    // TODO
    __block BOOL found = NO;
    __block Printer* selectedPrinter = nil;
    [_printerArray enumerateObjectsUsingBlock: ^(id obj, NSUInteger idx, BOOL *stop){
        selectedPrinter = (Printer *)obj;
        if ([inner_mac_address isEqualToString:(selectedPrinter.UUIDString)]) {
            found = YES;
            *stop = YES;
        }
    }];
    
    if (found) {
        [[PrinterSDK defaultPrinterSDK] connectBT:selectedPrinter];
        m_printer = selectedPrinter;
        resolve([NSString stringWithFormat:@"Connected to printer %@", selectedPrinter.name]);
    } else {
        reject(nil, [NSString stringWithFormat:@"Can't connect to printer %@", inner_mac_address], nil);
    }
    
}

RCT_EXPORT_METHOD(printText:(NSString *)text printerOptions:(NSDictionary *)options
                 print_data_resolver:(RCTPromiseResolveBlock)resolve
                 print_data_rejecter:(RCTPromiseRejectBlock)reject) {
    NSNumber* fontSizePtr = [options valueForKey:@"fontSize"];
    NSNumber* beepPtr = [options valueForKey:@"beep"];
    NSNumber* cutPtr = [options valueForKey:@"cut"];
    
    NSInteger fontSize = [fontSizePtr intValue] || 1;
    BOOL beep = (BOOL)[beepPtr intValue];
    BOOL cut = (BOOL)[cutPtr intValue];

    if (m_printer) {
        [[PrinterSDK defaultPrinterSDK] setFontSizeMultiple:(fontSize)];
        // [[PrinterSDK defaultPrinterSDK] printTestPaper];
        [[PrinterSDK defaultPrinterSDK] printText:text];
        beep ? [[PrinterSDK defaultPrinterSDK] beep] : nil;
        cut ? [[PrinterSDK defaultPrinterSDK] cutPaper] : nil;
        resolve(@"Print successful!!!");
    } else {
        reject(nil, @"Can't connect to printer", nil);
    }

}

RCT_REMAP_METHOD(closeConn,
                 close_connect_resolver:(RCTPromiseResolveBlock)resolve
                 close_connect_rejecter:(RCTPromiseRejectBlock)reject) {
    if (m_printer) {
        [[PrinterSDK defaultPrinterSDK] disconnect];
        m_printer = nil;
        resolve(@"Successful disconnect");
    } else {
        reject(nil, @"Can't disconnect to printer", nil);
    }

}

@end
