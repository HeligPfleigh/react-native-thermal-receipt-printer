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

RCT_REMAP_METHOD(testBLEFunction,
                  resolver: (RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    
    NSString *greeting = @"it's just a test";
    
    resolve(@[greeting]);
    
}

@end
