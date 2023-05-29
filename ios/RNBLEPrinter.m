//
//  RNBLEPrinter.m
//
//  Created by MTT on 06/10/19.
//  Copyright © 2019 Facebook. All rights reserved.
//
#import <Foundation/Foundation.h>

#import "PrinterSDK.h"
#import "RNBLEPrinter.h"


@implementation RNBLEPrinter

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(init
                  : (RCTResponseSenderBlock)successCallback fail
                  : (RCTResponseSenderBlock)errorCallback) {
  @try {
    _printerArray = [NSMutableArray new];
    m_printer = [[NSObject alloc] init];
    [[NSNotificationCenter defaultCenter]
        addObserver:self
           selector:@selector(handleNetPrinterConnectedNotification:)
               name:@"NetPrinterConnected"
             object:nil];
    // API MISUSE: <CBCentralManager> can only accept this command while in the
    // powered on state
    [[PrinterSDK defaultPrinterSDK]
        scanPrintersWithCompletion:^(Printer *printer){
        }];
    successCallback(@[ @"Init successful" ]);
  } @catch (NSException *exception) {
    errorCallback(@[ @"No bluetooth adapter available" ]);
  }
}

- (void)handleNetPrinterConnectedNotification:(NSNotification *)notification {
  m_printer = nil;
}

RCT_EXPORT_METHOD(getDeviceList
                  : (RCTResponseSenderBlock)successCallback fail
                  : (RCTResponseSenderBlock)errorCallback) {
  @try {
    !_printerArray ? [NSException raise:@"Null pointer exception"
                                 format:@"Must call init function first"]
                   : nil;
    [[PrinterSDK defaultPrinterSDK]
        scanPrintersWithCompletion:^(Printer *printer) {
          [_printerArray addObject:printer];
          NSMutableArray *mapped =
              [NSMutableArray arrayWithCapacity:[_printerArray count]];
          [_printerArray
              enumerateObjectsUsingBlock:^(id obj, NSUInteger idx, BOOL *stop) {
                NSDictionary *dict = @{
                  @"deviceName" : printer.name,
                  @"innerMacAddress" : printer.UUIDString
                };
                [mapped addObject:dict];
              }];
          NSMutableArray *uniquearray =
              (NSMutableArray *)[[NSSet setWithArray:mapped] allObjects];
          ;
          successCallback(@[ uniquearray ]);
        }];
  } @catch (NSException *exception) {
    errorCallback(@[ exception.reason ]);
  }
}

RCT_EXPORT_METHOD(connectPrinter
                  : (NSString *)innerMacAddress success
                  : (RCTResponseSenderBlock)successCallback fail
                  : (RCTResponseSenderBlock)errorCallback) {
  @try {
    __block BOOL found = NO;
    __block Printer *selectedPrinter = nil;
    [_printerArray enumerateObjectsUsingBlock:^(id obj, NSUInteger idx,
                                                BOOL *stop) {
      selectedPrinter = (Printer *)obj;
      if ([innerMacAddress isEqualToString:(selectedPrinter.UUIDString)]) {
        found = YES;
        *stop = YES;
      }
    }];

    if (found) {
      [[PrinterSDK defaultPrinterSDK] connectBT:selectedPrinter];
      [[NSNotificationCenter defaultCenter]
          postNotificationName:@"BLEPrinterConnected"
                        object:nil];
      m_printer = selectedPrinter;
      successCallback(@[ [NSString
          stringWithFormat:@"Connected to printer %@", selectedPrinter.name] ]);
    } else {
      [NSException raise:@"Invalid connection"
                  format:@"connectPrinter: Can't connect to printer %@",
                         innerMacAddress];
    }
  } @catch (NSException *exception) {
    errorCallback(@[ exception.reason ]);
  }
}

RCT_EXPORT_METHOD(printRawData
                  : (NSString *)text printerOptions
                  : (NSDictionary *)options fail
                  : (RCTResponseSenderBlock)errorCallback) {
  @try {
    !m_printer ? [NSException raise:@"Invalid connection"
                             format:@"printRawData: Can't connect to printer"]
               : nil;

    NSNumber *boldPtr = [options valueForKey:@"bold"];
    NSNumber *alignCenterPtr = [options valueForKey:@"center"];

    BOOL bold = (BOOL)[boldPtr intValue];
    BOOL alignCenter = (BOOL)[alignCenterPtr intValue];

    bold ? [[PrinterSDK defaultPrinterSDK] sendHex:@"1B2108"]
         : [[PrinterSDK defaultPrinterSDK] sendHex:@"1B2100"];
    alignCenter ? [[PrinterSDK defaultPrinterSDK] sendHex:@"1B6102"]
                : [[PrinterSDK defaultPrinterSDK] sendHex:@"1B6101"];
    [[PrinterSDK defaultPrinterSDK] printText:text];

    NSNumber *beepPtr = [options valueForKey:@"beep"];
    NSNumber *cutPtr = [options valueForKey:@"cut"];

    BOOL beep = (BOOL)[beepPtr intValue];
    BOOL cut = (BOOL)[cutPtr intValue];

    beep ? [[PrinterSDK defaultPrinterSDK] beep] : nil;
    cut ? [[PrinterSDK defaultPrinterSDK] cutPaper] : nil;

  } @catch (NSException *exception) {
    errorCallback(@[ exception.reason ]);
  }
}

RCT_EXPORT_METHOD(closeConn) {
  @try {
    !m_printer ? [NSException raise:@"Invalid connection"
                             format:@"closeConn: Can't connect to printer"]
               : nil;
    [[PrinterSDK defaultPrinterSDK] disconnect];
    m_printer = nil;
  } @catch (NSException *exception) {
    NSLog(@"%@", exception.reason);
  }
}

@end
