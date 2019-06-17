//
//  PrinterSDK.h
//  PrinterLibrary
//
//  Created by aduo on 5/30/16.
//
//

#ifndef __PRINTERSDK_H__
#define __PRINTERSDK_H__

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

extern NSString* PrinterConnectedNotification;
extern NSString* PrinterDisconnectedNotification;

@class Printer;

typedef void (^PrinterScanPrintersCallback) (Printer* printer);

typedef enum CodeBarType
{
    CodeBarType_UPC_A = 0,
    CodeBarType_UPC_E,
    CodeBarType_JAN13,
    CodeBarType_JAN8,
    CodeBarType_CODE39,
    CodeBarType_ITF,
    CodeBarType_CODABAR,
    CodeBarType_CODE93,
    CodeBarType_CODE128
} CodeBarType;

@interface Printer : NSObject

@property (nonatomic, readonly) NSString* name;
@property (nonatomic, readonly) NSString* UUIDString;

@end

@interface PrinterSDK : NSObject

+ (PrinterSDK*)defaultPrinterSDK;

- (void)scanPrintersWithCompletion:(PrinterScanPrintersCallback)callback;
- (void)stopScanPrinters;

- (BOOL)connectIP:(NSString*)ipAddress;

- (void)connectBT:(Printer*)printer;
- (void)disconnect;

- (void)setPrintWidth:(NSInteger)width;

- (void)printText:(NSString*)text;
- (void)printTextImage:(NSString*)text;
- (void)sendHex:(NSString*)hex;

- (void)printCodeBar:(NSString*)text type:(CodeBarType)type;
- (void)printQrCode:(NSString*)text;
- (void)printImage:(UIImage*)image;

- (void)cutPaper;
- (void)beep;
- (void)openCasher;
- (void)setFontSizeMultiple:(NSInteger)multiple;

- (void)printTestPaper;
- (void)selfTest;

@end

#endif
