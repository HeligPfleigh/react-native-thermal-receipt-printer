
#import "RNThermalReceiptPrinter.h"
#import "PrinterSDK.h"

@implementation RNThermalReceiptPrinter

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}
RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(greetUserWithPromises:(NSString *)name
                  isAdmin:(BOOL *)isAdmin
                  resolver: (RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {

  NSLog(@"User Name: %@ , Administrator: %@", name, isAdmin ? @"Yes" : @"No");

  NSString *greeting = [NSString stringWithFormat:@"Welcome %@, you %@ an administrator",
                        name, isAdmin ? @"are" : @"are not"];

  resolve(@[greeting]);

}

RCT_REMAP_METHOD(scanBLEPrinter,
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSMutableArray* _printerArray = [NSMutableArray new];

    [[PrinterSDK defaultPrinterSDK] scanPrintersWithCompletion:^(Printer* printer){
        [_printerArray addObject:printer];
    }];

    resolve(@[_printerArray]);

}

@end
