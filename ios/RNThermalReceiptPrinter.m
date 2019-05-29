
#import "RNThermalReceiptPrinter.h"

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

@end
  