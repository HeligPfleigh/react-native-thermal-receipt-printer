
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

RCT_EXPORT_METHOD(scanPrinter:resolver: (RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    __block NSMutableArray* _printerArray;
    [[PrinterSDK defaultPrinterSDK] scanPrintersWithCompletion:^(Printer* printer){
        if (nil == _printerArray)
        {
            _printerArray = [[NSMutableArray alloc] initWithCapacity:1];
        }
        
        [_printerArray addObject:printer];
    }];

    resolve(@[_printerArray]);
    
}

@end
