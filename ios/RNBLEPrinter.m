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

RCT_EXPORT_METHOD(closeConn) {
    @try {
        !m_printer ? [NSException raise:@"Invalid connection" format:@"closeConn: Can't connect to printer"] : nil;
        [[PrinterSDK defaultPrinterSDK] disconnect];
        m_printer = nil;
    } @catch (NSException *exception) {
        NSLog(@"%@", exception.reason);
    }
}

@end
